# Discord to Slack Exporter

Export any Discord text channels to a .csv file to import into Slack.

## Getting started

To export from Discord you need to setup a Discord Bot with read access and add it to your server.

### Create a discord bot

Head to https://discord.com/developers/ to get started.

After creating your Discord Bot you can add it by generating an invite URL.
Head to the **Oauth2** section and scroll down to select the desired scopes (**bot**).

![screenshot](https://user-images.githubusercontent.com/28757404/135346198-a902d164-223b-45cf-b700-9962c5959039.png)

After that you can select the required permissions. For this bot to work, we will need the **View Channel** and **Read Message History** permissions.

![screenshot](https://user-images.githubusercontent.com/28757404/135346208-5933149b-4b45-43a5-ba4f-947728829a99.png)

Once you got the invitation URL copy it from the **Scopes** section and navigate to the generated link. You can now add the bot to your server. Please note, that your account needs to be an **owner** of the server.

### Adding the required environment variables

navigate to the root folder of the project and run the follwoing command:

```
cp .env.example .env
```

This will create a .env file where you can add the required variables to connect the app with your discord bot:

- **DISCORD_TOKEN**: This is the token of your bot. You find it within the **Bot** section in the discord developer portal.
- **SERVER_ID**: This is the ID of the server you want to export from. Make sure your bot has been added beforehand. You find the ID by right-clicking your server name in the top left corner and selecting **Copy ID**. If you dont see this, you need to enable Developer Mode in your personal advanced settings in discord.

![screenshot](https://user-images.githubusercontent.com/28757404/135347782-d75da515-c1db-4e64-a073-ab31f896606d.png)

- **CLIENT_ID**: This is the Client ID of your bot. It is located within the **Oauth2** section in the discord developer portal.

### Export Configuration

You can configure what channels to export by simply constraining the bots rights on what channels it can view, or adding channel names to the `./src/config/export.json` file.
There are two paths to take:

- add _whitelisted_ channels to the `channels.filter` array
- add _blacklisted_ channels to the `channels.ignore` array
  Make sure both array do exist, they can be left empty however.

You can also change the export strategy. Setting the `strategy` value to `channels` will generate a .csv file for each channel. By default the `strategy` is set to `bulk` setting the export to one single .csv file for easy importing.

### Starting the application

To start the export of your channels first install the dependencies with `npm install`.

Now, if you are happy with your configuration you can now start the export by simply running `npm start`. Your .csv files will be exported to the `exports` directory in the project's root.

## Importing into Slack

You need to be an owner of the server to import to.
Within Slack, navigate to your server and click on the server name in the top left. Head to `Settings & administration > Workspace settings`.
You will be redirected to a webpage. Here you can find the import section for your workspace.

![Screenshot 2021-09-29 at 23 26 21](https://user-images.githubusercontent.com/28757404/135350848-045f952b-e8c9-4c37-8925-d4447a374eb9.png)
Click on `Import/Export Data` and select import via **CSV/Text File**. Upload your .csv files and follow the instructions from Slack. You can map your users and channels to existing ones in slack once the csv is uploaded corretly.
