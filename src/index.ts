import { Message, TextChannel, Channel } from 'discord.js'
import dotenv from 'dotenv'
import { Client, Intents } from 'discord.js'
import * as exportConfig from './config/export.json'
import Csv, { CsvObject } from './utils/Csv'
import { SlackMessage } from './@types/SlackMessage'
import path from 'path'
import fs from 'fs'
import * as ExportConfig from './config/export.json'
import {
  createSlackMessage,
  sortArrayByTimestamp,
  stringifySlackMessages
} from './utils/utils'
import { exit } from 'process'

dotenv.config()
export const exportDirectory = path.join(
  __dirname,
  `../${ExportConfig.exportDir}`
)

// ensure export directory exists
if (!fs.existsSync(exportDirectory)) {
  console.log(`Export directory not found. Creating at ${exportDirectory}`)
  fs.mkdirSync(exportDirectory)
}

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]
})

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
    (channel: Channel | TextChannel) => {
      if (
        !channel.isText() ||
        exportConfig.channels.ignore.includes(channel.name)
      )
        return false

      return (
        exportConfig.channels.filter.length <= 0 ||
        exportConfig.channels.filter.includes(channel.name)
      )
    }
  )

  console.log(
    'Found channels to export:',
    channelsToExport.map((channel: TextChannel) => channel.name)
  )

  const bulkCsv = new Csv('bulk-export')

  console.log(
    `Found ${ExportConfig.strategy} export strategy. Exporting ${
      ExportConfig.strategy === 'bulk'
        ? 'a single .csv file.'
        : 'one .csv file per channel.'
    }`
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
        sortArrayByTimestamp(slackMessages)
      )

      if (ExportConfig.strategy === 'bulk') {
        bulkCsv.append(csvObjects)
      } else {
        // create a new Csv instance
        const csv = new Csv(channel.name, csvObjects)
        // save the .csv file
        csv.save()
      }

      if (key === channelsToExport.lastKey()) {
        if (ExportConfig.strategy === 'bulk') {
          // if bulk saving we need to sort the entries again
          const csvObjects = sortArrayByTimestamp(
            bulkCsv.getCsvObjects() as unknown as SlackMessage[]
          )
          console.log('bulkCsv objects length:', bulkCsv.getCsvObjects().length)
          console.log('new csvObjects length:', csvObjects.length)
          bulkCsv.setCsvObjects(csvObjects)
          console.log(
            'bulkCsv objects length after setting:',
            bulkCsv.getCsvObjects().length
          )
          bulkCsv.save()
        }

        exportFinished(channelsToExport.size)
      }
    })
  })
})

// Login to Discord with your client's token
client.login(token)
