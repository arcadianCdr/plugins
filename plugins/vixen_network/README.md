## vixen_network 0.5.1

by boi123212321

Scrape data from VIXEN Network (VIXEN, BLACKED, BLACKED RAW, TUSHY, TUSHY RAW, DEEPER, SLAYED) scenes

### Download links
Each download link is for the latest version of the plugin, for the indicated porn-vault server version.  
Make sure you are reading the documentation of the plugin, for the correct porn-vault server version.  
| Server version                                                                                                 | Plugin documentation                                                                                          |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Download link for: stable](https://raw.githubusercontent.com/porn-vault/plugins/master/dist/vixen_network.js) | [documentation](https://github.com/porn-vault/porn-vault-plugins/blob/master/plugins/vixen_network/README.md) |


### Arguments

| Name         | Type    | Required | Description                        |
| ------------ | ------- | -------- | ---------------------------------- |
| stripString  | String  | false    | Matcher string regex               |
| dry          | Boolean | false    | Whether to commit data changes     |
| useThumbnail | Boolean | false    | Download & attach scene thumbnail  |
| useChapters  | Boolean | false    | Create scene markers from chapters |

### Example installation with default arguments

`config.json`

```json
---
{
  "plugins": {
    "register": {
      "vixen_network": {
        "path": "./plugins/vixen_network.js",
        "args": {
          "stripString": "[^a-zA-Z0-9'/\\,()[\\]{}-]",
          "dry": false,
          "useThumbnail": false,
          "useChapters": false
        }
      }
    },
    "events": {
      "sceneCreated": [
        "vixen_network"
      ],
      "sceneCustom": [
        "vixen_network"
      ]
    }
  }
}
---
```

`config.yaml`

```yaml
---
plugins:
  register:
    vixen_network:
      path: ./plugins/vixen_network.js
      args:
        stripString: "[^a-zA-Z0-9'/\\,()[\\]{}-]"
        dry: false
        useThumbnail: false
        useChapters: false
  events:
    sceneCreated:
      - vixen_network
    sceneCustom:
      - vixen_network

---

```
