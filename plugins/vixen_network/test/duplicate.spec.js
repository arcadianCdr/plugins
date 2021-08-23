const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");

const runPlugin = createPluginRunner("vixen_network", plugin);

const fixture = [
  [
    "Agatha Vega Vacay Blacked.mp4",
    {
      name: "Vacay",
    },
  ],
  [
    "Agatha Vega Vacay Part 2 Blacked.mp4",
    {
      name: "Vacay Part 2",
    },
  ],
  [
    "[Blacked] Vacay",
    {
      name: "Vacay",
    },
  ],
  [
    "[Blacked] Vacay Part 2",
    {
      name: "Vacay Part 2",
    },
  ],
];

describe("VIXEN network", () => {
  describe("Test scenes with duplicate names", () => {
    for (const [path, expected] of fixture) {
      it(`Duplicate: Should work for ${path}`, async () => {
        const result = await runPlugin({
          event: "sceneCreated",
          sceneName: "?????????????",
          scene: {
            _id: "xxx",
            name: "?????????????",
            path,
          },
        });
        expect(result.name).to.equal(expected.name);
      });
    }
  });
});
