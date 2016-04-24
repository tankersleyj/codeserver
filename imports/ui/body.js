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
        const sortAscending = instance.state.get('sortAscending');
        const showCompleted = instance.state.get('showCompleted');
        const showOtherUsers = instance.state.get('showOtherUsers');
        var sortDirection = -1;

        if (sortAscending) { sortDirection = 1; }
        if (showCompleted) {
            if (Meteor.user()) {
                if (showOtherUsers) {
                    return Tasks.find(
                        {$or: [{private: false}, {username: Meteor.user().username}]},
                        {sort: {'sort': sortDirection}},
                    )
                } else {
                    return Tasks.find(
                        {username: Meteor.user().username},
                        {sort: {'sort': sortDirection}},
                    )
                }
            } else {
                return Tasks.find(
                    {private: false},
                    {sort: {'sort': sortDirection}}
                )
            }
        } else {
            if (Meteor.user()) {
                if (showOtherUsers) {
                    return Tasks.find({
                            checked: {$ne: true},
                            $or: [{private: false}, {username: Meteor.user().username}]
                        },
                        {sort: {'sort': sortDirection}},
                    )
                } else {
                    return Tasks.find({
                            checked: {$ne: true},
                            username: Meteor.user().username
                        },
                        {sort: {'sort': sortDirection}},
                    )
                }
            } else {
                return Tasks.find({
                        checked: {$ne: true},
                        private: false
                    },
                    {sort: {'sort': sortDirection}}
                )
            }
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