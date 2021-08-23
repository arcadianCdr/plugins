const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");

const runPlugin = createPluginRunner("vixen_network", plugin);

const fixture = [
  [
    "Light Me Up - Slayed.mp4",
    {
      name: "Light Me Up",
      releaseDate: 1628157600000,
      description:
        "Exhibitionist, voyeur, artist and muse: when Emily and Vanna come together, they just can’t keep things professional. From a dazzling sapphic photoshoot springs a heated office affair as this pair turns the art world upside down.",
      actors: ["Emily Willis", "Vanna Bardot"],
      custom: {
        /*   director: "Alex Eikster", */
      },
      labels: [
        "ass fingering",
        "ass play",
        "brunette",
        "fingering",
        "high heels",
        "kissing",
        "lingerie",
        "natural tits",
        "orgasm",
        "pussy licking",
        "redhead",
        "squirting",
      ],
    },
  ],
];

describe("VIXEN network", () => {
  describe("SLAYED", () => {
    for (const [path, expected] of fixture) {
      it(`Basic: Should work for ${path}`, async () => {
        const result = await runPlugin({
          event: "sceneCreated",
          sceneName: "?????????????",
          scene: {
            _id: "xxx",
            name: "?????????????",
            path,
          },
          args: {
            useChapters: true,
          },
        });
        expect(result.name).to.equal(expected.name);
        expect(result.releaseDate).to.equal(expected.releaseDate);
        expect(result.description).to.equal(expected.description);
        expect(result.actors).to.deep.equal(expected.actors);
        expect(result.custom).to.deep.equal(expected.custom);
        expect(result.labels).to.deep.equal(expected.labels);
        expect(result.$thumbnail).to.be.a("string").that.contains("mainLandscape");
        expect(result.thumbnail).to.be.undefined;
        expect(result.$markers[1].name).to.equal("Kissing");
      });
    }
  });
});
