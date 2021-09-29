import { Message, TextChannel, Channel, Collection } from 'discord.js'
import dotenv from 'dotenv'
import { Client, Intents } from 'discord.js'
import * as exportConfig from './config/export.json'
import Csv from './utils/Csv'
import { SlackMessage } from './@types/SlackMessage'
import path from 'path'
import fs from 'fs'
import { exportDir } from './config/export.json'
import {
  createSlackMessage,
  prepareMessagesForSlackImport,
  stringifySlackMessages
} from './utils/utils'
import { exit } from 'process'

dotenv.config()
export const exportDirectory = path.join(__dirname, `../${exportDir}`)

// ensure export directory exists
if (!fs.existsSync(exportDirectory)) {
  console.log(`Export directory not found. Creating at ${exportDirectory}...`)
  fs.mkdirSync(exportDirectory)
}

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

const token = process.env.DISCORD_TOKEN

function exportFinished(exportCount: number) {
  console.log(
    `Finished export of ${exportCount} text channel${
      exportCount > 0 ? 's' : ''
    }.`
  )
  console.log(`Your exports should now be saved under ${exportDirectory}.`)
  exit(0)
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!')

  // get only text-channels to export and filter for names in config
  const channelsToExport = client.channels.cache.filter(
    (channel: Channel | TextChannel) =>
      channel.isText() && exportConfig.channels.includes(channel.name)
  )

  console.log(
    'Found channels to export:',
    channelsToExport.map((channel: TextChannel) => channel.name)
  )

  // loop through all channels to export
  channelsToExport.map((channel: TextChannel, key: string) => {
    // and fetch the messages from that channel
    channel.messages.fetch().then((messages) => {
      console.log(
        `Fetched ${messages.size} messages from channel "${channel.name}".`
      )

      // translate discord messages to a slack importable format
      const slackMessages: SlackMessage[] = messages.map((msg: Message) =>
        createSlackMessage(msg, channel)
      )

      // clean-up work, stringifying all entries & sorting by timestamp
      const csvObjects = stringifySlackMessages(
        prepareMessagesForSlackImport(slackMessages)
      )

      // create a new Csv instance
      const csv = new Csv(csvObjects, channel.name)

      // save the .csv file
      csv.save()

      if (key === channelsToExport.lastKey())
        exportFinished(channelsToExport.size)
    })
  })
})

// Login to Discord with your client's token
client.login(token)
