'use strict';

require('dotenv').config({ path: './.env' });
//const isEmpty = require('lodash.isempty');
const validator = require('validator');
const connectToDatabase = require('./database');
const Message = require('./models/Message');


/**
 * Helper
 * @param {*} statusCode
 * @param {*} message
 * @returns
 */
const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    error: message || 'Ocorreu um erro.',
  }),
});

/**
 * 
 * @param {*} error Mensagem de erro
 */
const returnError = (error, callback) => {
  console.log(error);
  if (error.name) {
    const message = `Invalid ${error.path}: ${error.value}`;
    callback(null, createErrorResponse(400, `Error:: ${message}`));
  } else {
    callback(
      null,
      createErrorResponse(error.statusCode || 500, `Error:: ${error.name}`)
    );
  }
};

/**
 * Parametros do CRUD de Message 
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 * @returns
 */
module.exports.create = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if ( event.body === {} || event.body === null || event.body === undefined) {
    return callback(null, createErrorResponse(400, 'Está faltando detalhes'));
  }
  const { title, description, reminder, status, category } = JSON.parse(
    event.body
  );

  const messageObj = new Message({
    title,
    description,
    reminder,
    status,
    category,
  });

  if (messageObj.validateSync()) {
    return callback(null, createErrorResponse(400, 'Dados incorretos'));
  }

  try {
    await connectToDatabase();
    console.log(messageObj);
    const note = await Message.create(messageObj);
    callback(null, {
      statusCode: 201,
      body: JSON.stringify(note),
    });
  } catch (error) {
    returnError(error, callback);
  }

};


module.exports.getOne = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const id = event.pathParameters.id;
  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect Id.'));
    return;
  }

  try {
    await connectToDatabase();
    const message = await Message.findById(id);

    if (!message) {
      callback(null, createErrorResponse(404, `Nenhuma mensagem localizada pelo id: ${id}`));
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(message),
    });
  } catch (error) {
    returnError(error, callback);
  }
};



module.exports.getAll = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectToDatabase();
    const messages = await Message.find();
    if (!messages) {
      callback(null, createErrorResponse(404, 'Nenhuma mensagem encontrada.'));
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(messages),
    });
  } catch (error) {
    returnError(error, callback);
  }
};




/**
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
module.exports.update = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);

  if (!validator.isAlphanumeric(event.pathParameters.id)) {
    callback(null, createErrorResponse(400, 'Ide incorreto.'));
    return;
  }

  if ( data === {} || data === null || data === undefined) {
    return callback(null, createErrorResponse(400, 'Está faltando os detalhes'));
  }
  const { title, description, reminder, status, category } = data;

  try {
    await connectToDatabase();

    const message = await Message.findById(event.pathParameters.id);

    if (message) {
      message.title = title || message.title;
      message.description = description || message.description;
      message.reminder = reminder || message.reminder;
      message.status = status || message.status;
      message.category = category || message.category;
    }

    const newMessage = await message.save();

    callback(null, {
      statusCode: 204,
      body: JSON.stringify(newMessage),
    });
  } catch (error) {
    returnError(error, callback);
  }
};


/**
 *
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
module.exports.delete = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const id = event.pathParameters.id;
  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Id Incorreto.'));
    return;
  }
  try {
    await connectToDatabase();
    const message = await Message.findByIdAndRemove(id);
    callback(null, {
      statusCode: 204,
      body: message,
    });
  } catch (error) {
    returnError(error, callback);
  }
};