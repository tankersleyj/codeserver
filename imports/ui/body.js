import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks');
});

Template.body.helpers({
    tasks() {
        const instance = Template.instance();
        const sortDescending = !instance.state.get('sortAscending');
        const hideCompleted = !instance.state.get('showCompleted');
        const hideOtherUsers = !instance.state.get('showOtherUsers');
        var sortDirection = 1;

        if (sortDescending) { sortDirection = -1; }
        if (hideCompleted) {
            // If hide completed is checked, filter tasks
            if (hideOtherUsers && Meteor.user()) {
                return Tasks.find({
                    checked: {$ne: true},
                    username: Meteor.user().username,
                }, {sort: {'sort': sortDirection}})
            } else {
                return Tasks.find({
                    checked: {$ne: true},
                }, {sort: {'sort': sortDirection}})
            }
        }

        // Otherwise, return all of the tasks
        if (hideOtherUsers && Meteor.user()) {
            return Tasks.find({
                username: Meteor.user().username,
            }, {sort: {'sort': sortDirection}})
        } else {
            return Tasks.find({
            }, {sort: {'sort': sortDirection}})
        }
    },

    incompleteCount() {
        return Tasks.find({ checked: { $ne: true } }, { sort: {'sort':1}}).count();
    },
    
});

Template.body.events({
    'submit .new-task'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Meteor.call('tasks.insert', text);

        // Clear form
        target.text.value = '';
    },

    'change .show-completed input'(event, instance) {
        instance.state.set('showCompleted', event.target.checked);
    },

    'change .show-other-users input'(event, instance) {
        instance.state.set('showOtherUsers', event.target.checked);
    },

    'change .sort-ascending input'(event, instance) {
        instance.state.set('sortAscending', event.target.checked);
    },
});