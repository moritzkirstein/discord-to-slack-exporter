import { Message, TextChannel } from 'discord.js'
import { SlackMessage } from '../@types/SlackMessage'

/**
 * creates a SlackMessage object from a given discord.js Message
 * @param {Message} message the discord.js message to convert
 * @param {TextChannel} channel the discord.js text channel of the message
 * @returns {SlackMessage} a new slack message object
 */
export function createSlackMessage(
  message: Message,
  channel: TextChannel
): SlackMessage {
  return {
    // convert to unix timestamp
    timestamp: Math.floor(message.createdTimestamp / 1000),
    // ensure uniqueness of usernames
    author: `${message.author.username}_${message.author.discriminator}`,
    channel: channel.name,
    message: message.content
  }
}

export function prepareMessagesForSlackImport(
  messages: SlackMessage[]
): SlackMessage[] {
  // messages need to be sorted by timestamp
  // see https://slack.com/intl/en-gb/help/articles/360035354694-Move-data-to-Slack-using-a-CSV-or-text-file
  return messages.sort((a, b) => {
    return a.timestamp > b.timestamp ? 1 : a.timestamp < b.timestamp ? -1 : 0
  })
}

export function stringifySlackMessages(
  messages: SlackMessage[]
): Record<string, string>[] {
  // convert timestamp to string
  return messages.map((msg) => ({
    ...msg,
    timestamp: msg.timestamp.toString()
  }))
}
