# 🦊 GitLab Iteration Analyzer

GitLab Analyzer is an analysis tool to analyze user contributions to a GitLab project.

## Sites & Servers

* Staging site:  
 `master` is continuously deployed on server <https://cmpt373-1211-08.cmpt.sfu.ca/> (aka -08 )  
  Target on our own Gitlab server: <https://cmpt373-1211-09.cmpt.sfu.ca/> (aka -09 )
  ``` 
  （1）register a user at <https://cmpt373-1211-09.cmpt.sfu.ca/>  
   (2) login as the admin (user: root, password: glimps123)
   (3) approve your request  
    (click the top-left 🔧 (Admin Area) -> click Overview -> click User ->click pending approval)
   (4) give your created user access to all repos 
   (5) sign out and login as your created user
  ```  
  New developers please send a request to Dr. Brian Fraser for admin access on these two servers (-08 and -09).
* Production site:  
  <https://cmpt373-1211-07.cmpt.sfu.ca/> (Target on SFU Gitlab Server: <https://csil-git1.cs.surrey.sfu.ca/>).
 
* Server access:   firstly connect to the SFU gateway by `$ssh -p24 your_sfu_computing_id@gateway.csil.sfu.ca`
  * to connect to the -08 server:  
      `$ssh -p24 your_sfu_computing_id@cmpt373-1211-08.cmpt.sfu.ca`   
  * to connect to the -09 server:   
     SSH into into a [CSIL host](https://www.sfu.ca/computing/about/support/covid-19-response--working-remotely/csil-linux-remote-access.html#csil-linux-systems) by `$ssh -p24 your_sfu_computing_id@csil_host`    
     then `$ssh -p24 your_sfu_computing_id@cmpt373-1211-09.cmpt.sfu.ca`    

  

## Development Setup & Information

See [docs/development.md](docs/development.md).

## Deployments

See [docs/deployment.md](docs/deployment.md).
