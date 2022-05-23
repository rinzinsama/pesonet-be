'use strict'

const Schema = use('Schema')

class TransactionListSchema extends Schema {
  up () {
    this.create('transaction_lists', (table) => {
      table.increments()

      table.string("reference_id", 15).notNullable().index();

      table.text("ofi_reference_number");

      table.text("rfi_reference_number");

      table.text("ofi_customer_reference_number");

      table.text("rfi_customer_reference_number");

      table.string("amount").index();

      table.text("remitter_name");

      table.text("remitter_account_number");

      table.text("creditor_name");

      table.text("creditor_account_number");

      table.string("sequence_number").index();

      table.date("settlement_date").index();

      table.string("type").index();

      table.timestamps()
    })
  }

  down () {
    this.drop('transaction_lists')
  }
}

module.exports = TransactionListSchema
