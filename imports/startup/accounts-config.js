import { Accounts } from 'meteor/accounts-base';
//import { Accounts } from 'meteor/facebook';

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
});