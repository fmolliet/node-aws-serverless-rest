const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = connectDataBase = async () => {
  try {
    const databaseConnection = await mongoose.connect(process.env.DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(`Database conectado ::: ${databaseConnection.connection.host}`);
  } catch (error) {
    console.error(`Erro::: ${error.message}`);
    process.exit(1);
  }
};