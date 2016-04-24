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
        var sortParent = -1;
        if (sortAscending) { sortDirection = 1; }

        if (showCompleted) {
            if (Meteor.user()) {
                if (showOtherUsers) {
                    return Tasks.find({
                            isChild: false,
                            $or: [{private: false}, {username: Meteor.user().username}]
                        },
                        {sort: {'sort': sortDirection}},
                    )
                } else {
                    return Tasks.find({
                            isChild: false,
                            username: Meteor.user().username
                        },
                        {sort: {'sort': sortDirection}},
                    )
                }
            } else {
                return Tasks.find({
                        isChild: false,
                        private: false
                    },
                    {sort: {'sort': sortDirection}}
                )
            }
        } else {
            if (Meteor.user()) {
                if (showOtherUsers) {
                    return Tasks.find({
                            isChild: false,
                            checked: {$ne: true},
                            $or: [{private: false}, {username: Meteor.user().username}]
                        },
                        {sort: {'sort': sortDirection}},
                    )
                } else {
                    return Tasks.find({
                            isChild: false,
                            checked: {$ne: true},
                            username: Meteor.user().username
                        },
                        {sort: {'sort': sortDirection}},
                    )
                }
            } else {
                return Tasks.find({
                        isChild: false,
                        checked: {$ne: true},
                        private: false
                    },
                    {sort: {'sort': sortDirection}}
                )
            }
        }

    },

    subTasks(taskParent) {
        var sortDirection = 1;
        var sortParent = taskParent;

        var childGt = Math.floor(sortParent);
        var childLt = Math.floor(sortParent + 1);
        
        return Tasks.find(
            {$and: [{sort: {$gt: childGt}}, {sort: {$lt: childLt}}]},
            {sort: {'sort': 1}}
        )
    },

    subTasksCount(taskParent) {
        // check(taskParent, Number);
        if (isNaN(taskParent)) {
            return 0;
        } else {
            var childGt = Math.floor(taskParent);
            var childLt = Math.floor(taskParent + 1);
            if (taskParent > childGt) {
                return 0;
            } else {
                return Tasks.find(
                    {$and: [{sort: {$gt: childGt}}, {sort: {$lt: childLt}}]},
                    {sort: {'sort': 1}}
                ).count()
            }
        }
    },

    incompleteCount() {
        if (Meteor.user()) {
            return Tasks.find({
                    checked: {$ne: true},
                    username: Meteor.user().username
                },
                {}
            ).count()
        } else {
            return Tasks.find({
                    checked: {$ne: true}
                },
                {}
            ).count()
        }
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