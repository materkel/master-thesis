'use strict';

const mongoose = require('mongoose');
const Event = mongoose.model('Event', {
  publishingDate: {
    type: Date,
    required: true
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
   * Read Job
   */
  read: id => {
    return Event.findById(id);
  },

  /**
   * Update Job
   */
  update: (id, data) => {
    return Event.findByIdAndUpdate(id, data, { 'new': true });
  },

  /**
   * Delete Job
   */
  delete: id => {
    return Event.findByIdAndRemove(id);
  }
}
