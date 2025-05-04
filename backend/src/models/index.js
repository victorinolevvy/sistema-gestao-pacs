const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const db = {};
const basename = path.basename(__filename);

console.log('[Model Loader] Starting model loading...');

// Dynamically load all model files from the current directory
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const filePath = path.join(__dirname, file);
    console.log(`[Model Loader] Processing file: ${file}`);
    try {
      const modelDefinition = require(filePath);
      let model = null;

      if (typeof modelDefinition === 'function') {
        // Check if the function's prototype indicates it's a Sequelize Model class
        const isModelClass = modelDefinition.prototype instanceof Sequelize.Model;
        console.log(`[Model Loader] File ${file}: Export is a function. Is Model Class? ${isModelClass}`);

        if (isModelClass) {
          // Case A: Export is the Model class itself
          model = modelDefinition;
          console.log(`[Model Loader] File ${file}: Identified as direct Model class export (${model.name}).`);
        } else {
          // Case B: Export is a function, but not a Model class -> Assume factory pattern
          console.log(`[Model Loader] File ${file}: Assuming factory function pattern.`);
          try {
            model = modelDefinition(sequelize, Sequelize.DataTypes);
            // Verify the factory returned a valid model class
            if (model && model.prototype instanceof Sequelize.Model) {
              console.log(`[Model Loader] File ${file}: Factory function executed successfully, loaded model ${model.name}.`);
            } else {
              console.warn(`[Model Loader] File ${file}: Factory function did NOT return a valid Sequelize Model class.`);
              model = null; // Discard if invalid
            }
          } catch (factoryError) {
            // If calling as a factory fails, log the specific error
            console.error(`[Model Loader] File ${file}: Error executing factory function:`, factoryError.message);
             // Check if the error is the specific TypeError, indicating we misidentified a class
             if (factoryError instanceof TypeError && factoryError.message.includes('cannot be invoked without \'new\'')) {
                 console.warn(`[Model Loader] File ${file}: Caught TypeError - the export might be a class, not a factory.`);
             }
            model = null; // Ensure model is null if factory call fails
          }
        }
      } else {
        // Handle cases where the export is not a function
        console.warn(`[Model Loader] File ${file}: Export is not a function (type: ${typeof modelDefinition}). Skipping.`);
      }

      // Add the successfully loaded and validated model to the db object
      if (model && model.name) {
        db[model.name] = model;
        console.log(`[Model Loader] File ${file}: Successfully added model ${model.name} to db object.`);
      } else {
         console.warn(`[Model Loader] File ${file}: Could not load a valid model.`);
      }
    } catch (requireError) {
        console.error(`[Model Loader] Error requiring file ${file}:`, requireError);
    }
  });

console.log('[Model Loader] Finished loading models. Associating models...');

// Call associate method on each model if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    console.log(`[Model Loader] Associating model: ${modelName}`);
    try {
        db[modelName].associate(db);
    } catch (associationError) {
        console.error(`[Model Loader] Error associating model ${modelName}:`, associationError);
    }
  } else {
      console.log(`[Model Loader] Model ${modelName} has no associate method.`);
  }
});

console.log('[Model Loader] Model association complete.');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;