# HydraBot

A bot designed to help run the [Coach-Pupil League (CPL)](https://liquipedia.net/starcraft/Coach_Pupil_League), a StarCraft league for beginning players.

It's written in Javascript (for Node.js) and uses SQLite for the database.

This project is currently not being actively worked on, but its status is that most of the boilerplate is done.

## Configuration

The bot requires a config directory to be present at `~/.config/hydrabot` with the following contents:

**config.json:**

```json
{
  "system": {
    "server": "SERVER_ID",
    "logChannel": "LOG_CHANNEL_ID",
    "logErrorChannel": "LOG_ERROR_CHANNEL_ID",
    "statusChannel": "STATUS_CHANNEL_ID"
  },
  "botUser": {
    "avatar": "<%pathData%>/avatar.png"
  }
}
```

**secrets.json:**

```json
{
  "id": "ID",
  "pubkey": "PUBKEY",
  "cid": "CID",
  "secretid": "SECRETID",
  "token": "TOKEN",
  "guildid": "GUILDID"
}
```

Also, an **avatar.png** file needs to be present here.

## License

MIT license.
