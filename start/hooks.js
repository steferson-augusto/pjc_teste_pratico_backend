const { hooks } = require("@adonisjs/ignitor")

hooks.before.providersBooted(() => {
  const Validator = use("Validator")
  const Database = use("Database")

  const existsFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (!value) {
      /**
       * skip validation if value is not defined. `required` rule
       * should take care of it.
       */
      return;
    }

    if (!message) message = "Item não encontrado."

    const [table, column] = args
    if (!column) column = field
    const row = await Database.table(table).where(column, value).first()

    if (!row) {
      throw message
    }
  }

  Validator.extend("exists", existsFn)
})
