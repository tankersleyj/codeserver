#SECTION: Create and deploy new meteor app
#URL: meteor.com
meteor create codeserver
cd codeserver
meteorSET DEPLOY_HOSTNAME=galaxy.meteor.com
meteor deploy codeserver.meteorapp.com

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

