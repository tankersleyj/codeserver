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
        const sortDescending = instance.state.get('sortDescending');
        const hideCompleted = instance.state.get('hideCompleted');
        const hideOtherUsers = instance.state.get('hideOtherUsers');
        var sortDirection = 1;
        var loggedUserName;
        if(!this.userId) {
            loggedUserName = "";
        }else{
            loggedUserName = Meteor.user().username;
        }

        if (sortDescending) { sortDirection = -1; }
        if (hideCompleted) {
            // If hide completed is checked, filter tasks
            if (hideOtherUsers) {
                return Tasks.find({
                    checked: {$ne: true},
                    username: loggedUserName,
                }, {sort: {'sort': sortDirection}})
            } else {
                return Tasks.find({
                    checked: {$ne: true},
                }, {sort: {'sort': sortDirection}})
            }
        }

        // Otherwise, return all of the tasks
        if (hideOtherUsers) {
            return Tasks.find({
                username: loggedUserName,
            }, {sort: {'sort': sortDirection}})
        } else {
            return Tasks.find({
            }, {sort: {'sort': sortDirection}})
        }
    },

    incompleteCount() {
        return Tasks.find({ checked: { $ne: true } }, { sort: {'sort':1}}).count();
    },

    loggedUserName() {
        return Meteor.user().username;
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

    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },

    'change .hide-other-users input'(event, instance) {
        instance.state.set('hideOtherUsers', event.target.checked);
    },

    'change .sort-descending input'(event, instance) {
        instance.state.set('sortDescending', event.target.checked);
    },
});