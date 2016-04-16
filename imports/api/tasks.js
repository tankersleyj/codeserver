import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server

    // Only publish tasks that are public or belong to the current user
    Meteor.publish('tasks', function tasksPublication() {
        const sortDirection = -1;

        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ]},
            {sort:{'sort':sortDirection}
        });
    });
}

Meteor.methods({
    'tasks.insert'(text) {
        check(text, String);

        // Make sure the user is logged in before inserting a task
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const task = Tasks.findOne({}, {sort: {sort: -1}});
        var maxSort = task.sort;

        if (!isNaN(parseFloat(maxSort))) {
            maxSort = parseFloat(maxSort) + 1;
        } else {
            maxSort = 1;
        }

        Tasks.insert({
            text: text,
            sort: maxSort,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
        });
    },

    'tasks.remove'(taskId) {
        check(taskId, String);
        const task = Tasks.findOne(taskId);
        // if (task.private && task.owner !== Meteor.userId()) {
        if (task.owner !== Meteor.userId()) {
            // make sure only the owner can delete it
            throw new Meteor.Error('not-authorized');
        }
        Tasks.remove(taskId);
    },

    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { checked: setChecked } });
    },

    'tasks.setSort'(taskId, setSort) {
        check(taskId, String);
        check(setSort, Number);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { sort: setSort } });
    },

    'tasks.setText'(taskId, setText) {
        check(taskId, String);
        check(setText, String);
        const task = Tasks.findOne(taskId);
        if (task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { text: setText } });
    },

    'tasks.setPrivate'(taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);

        // Make only logged in users can make a task private
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { private: setToPrivate } });
    },

    'tasks.setEdit'(taskId, setEdit) {
        check(taskId, String);
        check(setEdit, Boolean);

        const task = Tasks.findOne(taskId);

        // Make only logged in users can make a task private
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { edit: setEdit } });
    },

});