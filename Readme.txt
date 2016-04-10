#Create and deploy new meteor app
#meteor.com
meteor create codeserver
cd codeserver
meteorSET DEPLOY_HOSTNAME=galaxy.meteor.com
meteor deploy codeserver.meteorapp.com
meteor deploy codeserver.meteorapp.com

#add to git hub
# https://scotch.io/tutorials/how-to-push-an-existing-project-to-github
git init
git add -A
git commit -m 'Added my project'
git remote add origin git@github.com:jtankers/codeserver
git push -u -f origin master