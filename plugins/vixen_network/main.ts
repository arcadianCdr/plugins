import { SceneContext } from "../../types/scene";

interface ImageInfo {
  src: string;
  highdpi: {
    double: string;
  };
}

interface IGraphQLResult {
  data: {
    searchVideos: {
      edges: {
        node: {
          slug: string;
          description: string;
          title: string;
          releaseDate: string;
          models: { name: string }[];
          categories: { name: string }[];
          images: {
            poster: ImageInfo[];
          };
          chapters: {
            video: {
              title: string;
              seconds: number;
            }[];
          };
        };
      }[];
    };
  };
}

interface ISite {
  name: string;
  url: string;
}

const sites: ISite[] = [
  {
    name: "BLACKED RAW",
    url: "https://blackedraw.com",
  },
  {
    name: "BLACKED",
    url: "https://blacked.com",
  },
  {
    name: "TUSHY RAW",
    url: "https://tushyraw.com",
  },
  {
    name: "TUSHY",
    url: "https://tushy.com",
  },
  {
    name: "VIXEN",
    url: "https://vixen.com",
  },
  {
    name: "DEEPER",
    url: "https://deeper.com",
  },
  {
    name: "SLAYED",
    url: "https://slayed.com",
  },
];

function getArgs(ctx: SceneContext) {
  return ctx.args as Record<string, unknown>;
}

const graphqlQuery = `
query($query: String!, $site: Site!) {
  searchVideos(input: {
      query: $query,
      site: $site
  }) {
    edges {
      node {
        title
        slug
        description
        releaseDate
        categories {
          name
        }
        chapters {
          video {
            title
            seconds
          }
        }
        models {
          name
        }
        images {
          poster {
            ...ImageInfo
          }
        }
      }
    }
  }
}

fragment ImageInfo on Image {
  src
  highdpi {
    double
  }
}
`;

async function search(ctx: SceneContext, site: ISite, query: string) {
  const url = `${site.url}/graphql`;
  ctx.$logger.debug(`GET ${url} with query "${query}"`);
  const res = await ctx.$axios.get<IGraphQLResult>(url, {
    params: {
      query: graphqlQuery.trim(),
      variables: JSON.stringify({
        site: site.name.replace(/ /g, ""),
        query: query.trim(),
      }),
    },
  });
  return res.data.data.searchVideos.edges.map(({ node }) => node);
}

function basicMatch(ctx: SceneContext, a: string, b: string) {
  const stripString = <string>getArgs(ctx).stripString || "[^a-zA-Z0-9'/\\,()[\\]{}-]";
  const stripRegex = new RegExp(stripString, "g");

  function normalize(str: string) {
    return str.trim().toLocaleLowerCase().replace(stripRegex, "");
  }

  return normalize(a).includes(normalize(b));
}

function findSite(ctx: SceneContext, str: string) {
  return sites.find((site) => {
    ctx.$logger.debug(`Compare "${str}" <-> "${site.name}"`);
    return basicMatch(ctx, str, site.name);
  });
}

module.exports = async (ctx: SceneContext): Promise<any> => {
  const { $logger, sceneName, scene, event, $formatMessage, $path } = ctx;

  if (!sceneName) {
    $logger.error(`Invalid event: ${event}`);
    return {};
  }

  if (!scene.path) {
    $logger.error(`No scene path: ${scene._id}`);
    return {};
  }

  const result: {
    custom: Record<string, unknown>;
    $markers: { name: string; time: number }[];
    [key: string]: unknown;
  } = {
    custom: {},
    $markers: [],
  };
  $logger.verbose(`Checking VIXEN sites for "${scene.path}"`);

  const site = findSite(ctx, scene.path) || findSite(ctx, (await ctx.$getStudio()).name);

  if (!site) {
    $logger.warn(`No VIXEN site found in "${scene.path}"`);
    return {};
  }

  const basename = $path.basename(scene.path);
  const filename = basename.replace($path.extname(basename), "");

  const searchResults = await search(ctx, site, filename);
  $logger.debug("Search results:");
  $logger.debug($formatMessage(searchResults.map(({ title }) => title)));

  const found = searchResults
    .filter(({ title }) => basicMatch(ctx, filename, title))
    .sort((a, b) => b.title.length - a.title.length)[0];

  if (!found) {
    $logger.warn(`No result found for "${site.url}"`);
    return {};
  }

  $logger.verbose(`Using scene "${found.title}"`);

  result.name = found.title;
  result.actors = found.models.map(({ name }) => name).sort();
  result.description = found.description;
  result.studio = site.name;
  result.releaseDate = new Date(found.releaseDate).valueOf();
  result.labels = found.categories.map(({ name }) => name).sort();
  const thumbUrl = found.images.poster[3].src;
  result.$thumbnail = thumbUrl;

  const args = getArgs(ctx);

  if (args.useThumbnail) {
    $logger.verbose("Setting thumbnail");
    result.thumbnail = await ctx.$createImage(thumbUrl, `${result.name}`, true);
  }

  if (args.useChapters) {
    const chapters = found.chapters.video;
    for (const { title, seconds } of chapters) {
      result.$markers.push({
        name: title,
        time: seconds,
      });
    }
  }

  if (args.dry) {
    $logger.info(`Would have returned ${$formatMessage(result)}`);
    return {};
  }

  $logger.verbose(`Creating ${result.$markers.length} markers`);
  for (const { name, time } of result.$markers) {
    $logger.silly(`Creating marker: ${name} at ${time}s`);
    await ctx.$createMarker(name, time);
  }

  return result;
};
