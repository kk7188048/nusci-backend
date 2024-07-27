import {
  ErrorInternalAPIModelFieldValidation,
  ErrorInternalAPIModelSchemaValidation,
  ErrorInternalAPIModelValidation,
} from "../../error/internalErrors.js";

/**
 * BaseModel Abstract Class
 *
 * This class serves as the parent class for all other API Models,
 * and provides static utility functions that API Models should have.
 *
 */
export class BaseModel {
  constructor(json, schema) {
    try {
      this.validate(json, schema);
      for (const key of Object.keys(json)) {
        this[key] = json[key];
      }
    } catch (e) {
      throw new ErrorInternalAPIModelValidation(e.message);
    }
  }

  /**
   * Given a Schema, this method will ensure the given JSON
   * conforms to the types defined in the schema. Throws an error
   * if improper type.
   *
   * @param {JSON} json
   * @param {JSON} schema
   */
  validate(json, schema) {
    // add fields in schema not given in json to json
    for (const key in schema) {
      if (!json.hasOwnProperty(key)) {
        // console.log("before", json);
        // console.log("added key: ", key, " with value: ", json[key]);
        json[key] = undefined;
        // console.log("after", json);
      }
    }

    // iterate through json
    for (const key in json) {
      // the key does not exist in the schema
      if (schema[key] === undefined) {
        //console.log(JSON.stringify(schema));
        //console.log(`\nDeleted {${key}: ${json[key]}}\n\n`);
        delete json[key];
        continue;
      }

      // key exists in schema
      let value = json[key];
      const schemaType = schema[key].type;
      const required = schema[key].required;
      const enumValues = schema[key].enum;
      const defaultValue = schema[key].default;
      const override = schema[key].override;

      // valid schema creation
      if (required && type(required) !== boolean) {
        throw new ErrorInternalAPIModelSchemaValidation("Required option not boolean.");
      }

      if (override && type(override) !== boolean) {
        throw new ErrorInternalAPIModelSchemaValidation("Override option not boolean.");
      }

      if (enumValues && !Array.isArray(enumValues)) {
        throw new ErrorInternalAPIModelSchemaValidation("Enum values must be a list.");
      }

      // override set
      if ((value === undefined && defaultValue !== undefined) || override) {
        json[key] = typeof defaultValue === "function" ? defaultValue() : defaultValue;
        value = json[key];
      }

      // required
      if (required && value === undefined) {
        throw new ErrorInternalAPIModelFieldValidation(`Field '${key}' is required.`);
      }

      if (!required && value === undefined) {
        continue;
      }

      // objectOnly
      if (type(schemaType) === objectOnly) {
        if (type(value) !== object) {
          throw new ErrorInternalAPIModelFieldValidation(`Field '${key}' must have type '${schemaType}'. Given: ${value}`);
        }
        continue;
      }

      // mismatch type
      if (type(value) !== type(schemaType)) {
        throw new ErrorInternalAPIModelFieldValidation(`Field '${key}' must have type '${schemaType}'. Given: ${value}`);
      }

      // enum values (check complex enum values, like objects or lists)
      if (enumValues) {
        if (!Array.isArray(value) && !contains(enumValues, value)) {
          // single enum
          throw new ErrorInternalAPIModelFieldValidation(
            `Invalid value '${value}' for field '${key}'. Must be one of: ${enumValues.join(", ")}`
          );
        } else if (Array.isArray && !value.every((enumValue) => contains(enumValues, enumValue))) {
          // list of enum
          throw new ErrorInternalAPIModelFieldValidation(
            `Invalid value '${value}' for field '${key}'. Must be list of: ${enumValues.join(", ")}`
          );
        }
        // all enum values handled
        continue;
      }

      // object
      if (type(schemaType) === object) {
        this.validate(value, schemaType);
        continue;
      }

      // array
      if (type(schemaType) === array) {
        const arrayType = schemaType[0];
        if (type(arrayType) !== object) {
          // basic list
          if (value.some((item) => type(item) !== arrayType)) {
            throw new ErrorInternalAPIModelFieldValidation(`Invalid element of '${value}' not of type '${arrayType}'`);
          }
        } else {
          // list of objects
          value.forEach((item) => this.validate(item, arrayType));
        }
      }
    }
  }
}

export class BaseModelUpdate extends BaseModel {
  constructor(json, schema) {
    super(json, schema);
    this.validateUpdate(json);
  }

  /**
   * Validates that upon update, at least one
   * field is actually being updated.
   *
   * @param {JSON} json
   * @param {JSON} schema
   */
  validateUpdate(json) {
    if (!Object.values(json).some((value) => value !== undefined)) {
      throw new ErrorInternalAPIModelFieldValidation("Invalid update model.");
    }
  }
}

// Delegated Atomic Types
export const number = "number";
export const boolean = "boolean";
export const string = "string";
export const array = "array";
export const object = "object";
export const date = "date";
export const empty = "undefined";

const objectOnly = "objectOnly";

// current date default option
export const now = () => new Date();

/**
 * type function
 *
 * Returns the API Model atomic type of the given object.
 *
 * @param {any} obj
 * @returns {boolean}
 */
function type(obj) {
  if (Array.isArray(obj)) {
    return array;
  }
  if (obj instanceof Date) {
    return date;
  }
  if (typeof obj === string) {
    switch (obj) {
      case boolean:
        return boolean;
      case number:
        return number;
      case string:
        return string;
      case object:
        return objectOnly;
      case array:
        return array;
      case date:
        return date;
      case empty:
        return empty;
    }
  }
  return typeof obj;
}

/**
 * contains function
 *
 * Stronger contains that relies on JSON.stringify of
 * objects to determine membership in a list.
 *
 * @param {Array} list
 * @param {any} value
 * @returns {boolean}
 */
function contains(list, value) {
  if (type(list) !== array) {
    return false;
  }
  let strValue = JSON.stringify(value);
  return list.some((e) => JSON.stringify(e) === strValue);
}
