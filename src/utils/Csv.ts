import fs from 'fs'
import sanitize from 'sanitize-filename'
import { exportDirectory } from '..'

type CsvObject = Record<string, string>

/**
 * Csv utility class
 * A simple class for translating a number of objects of strings to a .csv file
 */
class Csv {
  private csvObjects: CsvObject[]
  private fileName: string

  /**
   * constructor
   * @param {CsvObject[]} csvObjects the csvObjects the .csv file should be generated with
   * @param {string} fileName the name of the generated .csv file
   */
  constructor(csvObjects: CsvObject[], fileName: string) {
    this.csvObjects = csvObjects
    this.fileName = `${exportDirectory}/${sanitize(fileName)}.csv`

    console.log(
      `Creating a new Csv at ${this.fileName} with ${this.csvObjects.length} lines.`
    )
  }

  /**
   * saves or overwrites a .csv file at the specified
   * filename with the given csvObjects
   * uses the exportDirectory configurable in src/config/export.json
   */
  save(): void {
    if (!this.csvObjects || !this.fileName)
      throw 'csvObject and fileName need to be defined'

    const csvString = this.toString()

    try {
      console.log(`Saving .csv at ${this.fileName}...`)
      fs.writeFileSync(this.fileName, csvString)
      console.log(`${this.fileName} saved!`)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Helper function to convert a csvObject to a .csv line
   * @param {CsvObject} csvObject the csvObject to convert
   * @returns {string} a string in the .csv format, delimited by ','
   */
  static csvObjectToString(csvObject: CsvObject): string {
    const keys = Object.keys(csvObject)

    const csvString = keys.map((key: string) => `"${csvObject[key]}"`).join()

    return csvString
  }

  /**
   * Stringify this instance of Csv
   * uses the given csvObjects and creates one .csv new line per object
   * @returns {string} a valid .csv string, containing several lines
   */
  toString(): string {
    return this.csvObjects
      .map((csvObject) => Csv.csvObjectToString(csvObject))
      .join('\n')
  }
}

export default Csv
