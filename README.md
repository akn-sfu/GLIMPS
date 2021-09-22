# 🦊 GitLab Iteration Analyzer

GitLab Analyzer is an analysis tool to analyze user contributions to a GitLab project.

## Sites & Servers

* `master` is continuously deployed on: <https://cmpt373-1211-08.cmpt.sfu.ca/> (Target Gitlab Server: <https://cmpt373-1211-09.cmpt.sfu.ca/>).
  ``` 
  Gitlab Admin
  name: root
  password: glimps123
  ```

* <https://cmpt373-1211-07.cmpt.sfu.ca/> (Target Gitlab Server: <https://csil-git1.cs.surrey.sfu.ca/>).
* New developers please send a request to Dr. Brian Fraser for admin access on these two Servers(-08 and -09)
* Server access:  
(1) SSH into sfu csil gateway by `ssh -p24 your_sfu_computing_id@gateway.csil.sfu.ca`  
(2) SSH into into a csil host by `ssh -p24 your_sfu_computing_id@csil_host`  (you can skip this step if you are trying to SSH into -08 server.)  
(3) SSH into the target server `ssh -p24 your_sfu_computing_id@cmpt373-1211-09.cmpt.sfu.ca`  

  

## Development Setup & Information

See [docs/development.md](docs/development.md).

## Deployments

See [docs/deployment.md](docs/deployment.md).
