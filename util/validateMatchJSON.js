const Ajv = require("ajv");
const ajv = new Ajv();

const usersSchema = {
  type: "array",
  items: {
    type: "object",
    required: ["user_id", "guessCount", "wordGuessed", "lastResult"],
    properties: {
      user_id: {
        type: "integer",
      },
      guessCount: {
        type: "integer",
      },
      wordGuessed: {
        type: "boolean",
      },
      lastResult: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
};

const validate = ajv.compile(usersSchema);

module.exports = validate;
