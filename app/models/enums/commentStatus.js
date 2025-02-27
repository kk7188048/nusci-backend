import { ErrorValidation } from "../../error/errors.js";

/**
 * Enumerated Class for Comment Statuses
 */
export default class CommentStatus {
  static Resolved = new CommentStatus("resolved");
  static Unresolved = new CommentStatus("unresolved");
  static Public = new CommentStatus("public");

  /**
   * INTERNAL USE ONLY
   * Construct a CommentStatus enum
   *
   * @param {String} status
   */
  constructor(status) {
    this.status = status;
  }

  /**
   * CommentStatus to its associated string
   *
   * @returns {String}
   */
  toString() {
    return this.status;
  }

  /**
   * String to its associated CommentStatus object
   *
   * @param {String} str
   * @returns {CommentStatus}
   */
  static toCommentStatus(str) {
    switch (str.toLowerCase()) {
      case this.Resolved.status:
        return this.Resolved;
      case this.Unresolved.status:
        return this.Unresolved;
      case this.Public.status:
        return this.Public;
      default:
        throw new ErrorValidation("Invalid CommentStatus enum given.");
    }
  }

  /**
   * Returns all CommentStatus objects as a list.
   *
   * @returns {List[CommentStatus]}
   */
  static list() {
    return Object.values(this);
  }

  /**
   * Returns all CommentStatus as a list of strings
   */
  static listr() {
    return Object.values(this).map((val) => val.toString());
  }
}
