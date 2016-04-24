#install coffee-script transcompiler for webstorm
npm install -g coffee-script

#SECTION: Create and deploy new meteor app
#URL: meteor.com
meteor create codeserver
cd codeserver
meteor npm install  #see tutorial?
meteor SET DEPLOY_HOSTNAME=galaxy.meteor.com
>DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy codeserver.meteorapp.com

#DEPLOY
meteor deploy codeserver.meteorapp.com --settings ./settings.json

#SECTION: Run
#URL: http://codeserver.meteorapp.com

#SECTION: add to git hub
#URL: https://scotch.io/tutorials/how-to-push-an-existing-project-to-github
git init
git add -A
git commit -m 'codeserver'
git remote add origin https://github.com/jtankers/codeserver.git
#Note: Assure that .git/config > url = https://github.com/jtankers/codeserver.git
git push -u -f origin master


#Reactive Dictionary
meteor add reactive-dict