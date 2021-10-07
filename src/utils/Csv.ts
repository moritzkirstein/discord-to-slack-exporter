import { exportDirectory } from '..'
import { saveStringToFile } from './utils'

export type CsvObject = Record<string, string>

/**
 * Csv utility class
 * A simple class for translating a number of objects of strings to a .csv file
 */
class Csv {
  private csvObjects: CsvObject[] = []
  private fileName: string

  /**
   * constructor
   * @param {CsvObject[]} csvObjects the csvObjects the .csv file should be generated with
   * @param {string} fileName the name of the generated .csv file
   */
  constructor(fileName: string, csvObjects?: CsvObject[]) {
    this.fileName = `${exportDirectory}/${fileName}.csv`

    if (csvObjects) this.csvObjects = csvObjects

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
      throw 'csvObjects and fileName need to be defined'

    const csvString = this.toString()
    console.log(
      `Writing csvString to ${this.fileName} with length:`,
      csvString.length
    )

    saveStringToFile(csvString, this.fileName)
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

  /**
   * append to the csvObjects []
   * @param {CsvObject[]} csvObjects the csvObjects to append
   */
  append(csvObjects: CsvObject[]): void {
    this.setCsvObjects(this.csvObjects.concat(csvObjects))
  }

  /**
   * set the csvObjects []
   * @param {CsvObject[]} csvObjects the csvObjects to set to
   */
  setCsvObjects(csvObjects: CsvObject[]): void {
    this.csvObjects = csvObjects
  }

  /**
   * Getter
   * @return {CsvObject[]} the CsvObject[] of this Csv instance
   */
  getCsvObjects(): CsvObject[] {
    return this.csvObjects
  }

  /**
   * Getter
   * @return {string} the filename of this Csv instance
   */
  getFileName(): string {
    return this.fileName
  }
}

export default Csv
