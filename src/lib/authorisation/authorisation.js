import _ from 'lodash';
import {UnauthorisedError} from "../errors/index.js";

class Authorisation {
    /**
     * @param {*} user  Current logged in user object
     * @param {*} httpRequestMethod   HTTP request method e.g GET/POST/PUT/DELETE
     * @param {*} resource  Requested resource e.g user, case etc.
     */
    constructor(user, httpRequestMethod, resource,roles) 
    {
        this.user = user;
        // this.httpRequestMethod = httpRequestMethod;
        // this.resource = resource;
        this.roles = roles;
    }

    /**
     * Method to check if user has access to given protected resource
     */
//     async isAllowed() 
//     {
//         try 
//         {
//             //TODO: take from http request

// //                   let templatePermission = {};
// //
// //                   templatePermission = await userService.getPrivileges(this.user.id, this.user.id);
// //
// //                    if(templatePermission.permission.indexOf(this.resource) == -1){
// //                        reject(new UnauthorisedError());
// //                    }else{
// //                        resolve();
// //                    }

//             console.log("user..................",this.user)
//             console.log("role..................",this.roles)

//             this.user.Roles.forEach(obj => {

//                 if (this.roles.includes(obj.name)) {
//                     resolve(this.user);
//                 }
//             });

//             reject(new UnauthorisedError());
//         } 
//         catch (err) 
//         {
//             console.error(err);
//             throw err
//         }
      
//     }

    isAllowed() 
    {
        return new Promise(async (resolve, reject) => {
            try 
            {

    //              // if user has a provided role
                this.user.Roles.forEach(obj => {

                    if (this.roles.includes(obj.name)) {
                        resolve(this.user);
                    }
                });

                reject(new UnauthorisedError());
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    
    }

}

export default Authorisation;
