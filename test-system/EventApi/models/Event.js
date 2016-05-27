'use strict';

const db = require('./MongoDB');

const Event = db.model('Event', {
  publishingDate: {
    type: Date,
    required: true
  },
  jobId: {
    type: Number,
    required: false
  }
});

module.exports = {
  /**
   * Access Event Model
   */
  Model: () => {
    return Event;
  },

  /**
   * Create Event
   */
  create: data => {
    let event = new Event(data);
    return event.save();
  },

  /**
   * Read Event
   */
  read: id => {
    return Event.findById(id);
  },

  /**
   * Update Evebt
   */
  update: (id, data) => {
    return Event.findByIdAndUpdate(id, data, { 'new': true });
  },

  /**
   * Delete Event
   */
  delete: id => {
    return Event.findByIdAndRemove(id);
  },

  /**
   * Count Events
   */
  count: () => {
    return Event.count();
  },

  /**
   * Delete all Events
   */
  deleteAll: () => {
    return Event.remove();
  },

  /**
   * Read all Events
   */
  findAll: () => {
    return Event.find();
  }
}
