import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');
import './tasks-coffee.js';

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
    'tasks.insert'(newText) {
        check(newText, String);
        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var newSort=1;
        var taskNum=newText.split(" ", 1)[0];
        if (!isNaN(taskNum)) {
            newSort=parseFloat(taskNum);
            var textStart=taskNum.length + 1;
            newText=newText.substring(textStart);
        } else {
            const task = Tasks.findOne({username: Meteor.user().username}, {sort: {'sort': -1}});
            if (task) {
                if (!isNaN(parseInt(task.sort))) {
                    newSort = parseInt(task.sort) + 1;
                }
            }
        }

        var isChild=false;
        if (newSort != Math.floor(newSort)) { isChild=true; }
        var htmlText = Meteor.call('tasks.filterHtmlFormatTags', newText);

        Tasks.insert({
            text: newText,
            sort: newSort,
            createdAt: new Date(),
            editedAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            htmlText: htmlText,
            private: true,
            isChild: isChild,
        });
    },

    'tasks.remove'(taskId) {
        check(taskId, String);
        const task = Tasks.findOne(taskId);
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        var sortP = task.sort;
        if (sortP != parseInt(sortP)) {
            Tasks.remove(taskId);  // parent
        } else {
            var sortGt = parseInt(sortP);
            var sortLt = sortGt + 1;
            var subTasks = Tasks.find({
                    $and: [{sort: {$gt: sortGt}}, {sort: {$lt: sortLt}}]
                },
                {sort: {'sort': 1}},
            ).count()
            if (subTasks==0) {
                Tasks.remove(taskId);
            }
        }
    },

    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { checked: setChecked } });
    },

    'tasks.setSort'(taskId, setSort) {
        check(taskId, String);
        check(setSort, Number);
        const task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { sort: setSort } });
        var isChild=false;
        if (setSort != Math.floor(setSort)) { isChild=true; }
        Tasks.update(taskId, { $set: { isChild: isChild } });
    },

    'tasks.setText'(taskId, setText) {
        check(taskId, String);
        check(setText, String);
        const task = Tasks.findOne(taskId);
        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { text: setText } });
        var htmlText = Meteor.call('tasks.filterHtmlFormatTags', setText);
        Tasks.update(taskId, { $set: { htmlText: htmlText } });
        Tasks.update(taskId, { $set: { editedAt: new Date() } });
        Tasks.update(taskId, { $set: { edited: true } });
    },

    'tasks.filterHtmlFormatTags'(tagText) {
        check(tagText, String);
        var htmlText = tagText;
        // disable all html
        htmlText = htmlText.replace(/</gi,'(').replace(/>/gi,')');
        // re-enable selected html
        htmlText = htmlText.replace(/\(b\)/gi,'<b>').replace(/\(\/b\)/gi,'</b>');
        htmlText = htmlText.replace(/\(br\)/gi,'<br>');
        htmlText = htmlText.replace(/\(del\)/gi,'<del>').replace(/\(\/del\)/gi,'</del>');
        htmlText = htmlText.replace(/\(details\)/gi,'<details>').replace(/\(\/details\)/gi,'</details>');
        htmlText = htmlText.replace(/\(em\)/gi,'<em>').replace(/\(\/em\)/gi,'</em>');
        htmlText = htmlText.replace(/\(h1\)/gi,'<h1>').replace(/\(\/h1\)/gi,'</h1>');
        htmlText = htmlText.replace(/\(h2\)/gi,'<h2>').replace(/\(\/h2\)/gi,'</h2>');
        htmlText = htmlText.replace(/\(h3\)/gi,'<h3>').replace(/\(\/h3\)/gi,'</h3>');
        htmlText = htmlText.replace(/\(h4\)/gi,'<h4>').replace(/\(\/h4\)/gi,'</h4>');
        htmlText = htmlText.replace(/\(h5\)/gi,'<h5>').replace(/\(\/h5\)/gi,'</h5>');
        htmlText = htmlText.replace(/\(h6\)/gi,'<h6>').replace(/\(\/h6\)/gi,'</h6>');
        htmlText = htmlText.replace(/\(i\)/gi,'<i>').replace(/\(\/i\)/gi,'</i>');
        htmlText = htmlText.replace(/\(li\)/gi,'<li>').replace(/\(\/li\)/gi,'</li>');
        htmlText = htmlText.replace(/\(output\)/gi,'<output>').replace(/\(\/output\)/gi,'</output>');
        htmlText = htmlText.replace(/\(p\)/gi,'<p>').replace(/\(\/p\)/gi,'</p>');
        htmlText = htmlText.replace(/\(q\)/gi,'<q>').replace(/\(\/q\)/gi,'</q>');
        htmlText = htmlText.replace(/\(s\)/gi,'<s>').replace(/\(\/s\)/gi,'</s>');
        htmlText = htmlText.replace(/\(samp\)/gi,'<samp>').replace(/\(\/samp\)/gi,'</samp>');
        htmlText = htmlText.replace(/\(small\)/gi,'<small>').replace(/\(\/small\)/gi,'</small>');
        htmlText = htmlText.replace(/\(strong\)/gi,'<strong>').replace(/\(\/strong\)/gi,'</strong>');htmlText = htmlText.replace(/\(sup\)/gi,'<sup>').replace(/\(\/sup\)/gi,'</sup>');
        htmlText = htmlText.replace(/\(summary\)/gi,'<summary>').replace(/\(\/summary\)/gi,'</summary>');
        htmlText = htmlText.replace(/\(sub\)/gi,'<sub>').replace(/\(\/sub\)/gi,'</sub>');
        htmlText = htmlText.replace(/\(sup\)/gi,'<sup>').replace(/\(\/sup\)/gi,'</sup>');
        htmlText = htmlText.replace(/\(tfoot\)/gi,'<tfoot>').replace(/\(\/tfoot\)/gi,'</tfoot>');
        htmlText = htmlText.replace(/\(u\)/gi,'<u>').replace(/\(\/u\)/gi,'</u>');
        htmlText = htmlText.replace(/\(ul\)/gi,'<ul>').replace(/\(\/ul\)/gi,'</ul>');
        htmlText = htmlText.replace(/\(var\)/gi,'<var>').replace(/\(\/var\)/gi,'</var>');
        htmlText = htmlText.replace(/\(wbr\)/gi,'<wbr>').replace(/\(\/wbr\)/gi,'</wbr>');
        htmlText = htmlText.replace(/\(blockquote\)/gi,'<blockquote>').replace(/\(\/blockquote\)/gi,'</blockquote>');
        htmlText = htmlText.replace(/\(code\)/gi,'<code>').replace(/\(\/code\)/gi,'</code>');
        return htmlText;
    },

    'tasks.startDetails'(sort) {
        // check(sort, Number);
        // var startDetails = true;
        // if (Number.isInteger(sort)==true) { startDetails=true; }
        return sort;
    },

    'tasks.endDetails'(sort) {
        // check(sort, Number);
        var endDetails = false;
        if (Number.isInteger(sort)==true) { endDetails=true; }
        return endDetails;
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

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Tasks.update(taskId, { $set: { edit: setEdit } });
    },

});
