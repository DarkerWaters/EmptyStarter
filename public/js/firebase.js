function signinFirebase() {
    // Initialize the FirebaseUI Widget using Firebase.
    // https://firebase.google.com/docs/auth/web/firebaseui
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // signed in successfully, hide the box we used to select the type
                document.getElementById('firebase_login_container').style.display = "none";
                // and we can get the data here
                /*
                var user = authResult.user;
                var credential = authResult.credential;
                var isNewUser = authResult.additionalUserInfo.isNewUser;
                var providerId = authResult.additionalUserInfo.providerId;
                var operationType = authResult.operationType;
                // Do something with the returned AuthResult.
                */
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            signInFailure: function (error) {
                // Some unrecoverable error occurred during sign-in.
                document.getElementById('firebase_login_container').style.display = "none";
                // Return a promise when error handling is completed and FirebaseUI
                // will reset, clearing any UI. This commonly occurs for error code
                // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
                // occurs. Check below for more details on this.
                return handleUIError(error);
            },
            uiShown: function () {
                // The widget is rendered, hide the loader button
                var signIn = document.getElementById('firebaseSignIn');
                if (signIn) {
                    signIn.style.display = 'none';
                }
            }
        },
        credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
        // Query parameter name for mode.
        queryParameterForWidgetMode: 'mode',
        // Query parameter name for sign in success url.
        queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '#',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
            /*,firebase.auth.TwitterAuthProvider.PROVIDER_ID
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                // Whether the display name should be displayed in the Sign Up page.
                requireDisplayName: true
            }*/
            /*,{
                provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                // Invisible reCAPTCHA with image challenge and bottom left badge.
                recaptchaParameters: {
                    type: 'image',
                    size: 'invisible',
                    badge: 'bottomleft'
                }
            }*/
            //,firebase.auth.FacebookAuthProvider.PROVIDER_ID
            //,firebase.auth.GithubAuthProvider.PROVIDER_ID
            //,firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // TODO Terms of service url.
        //tosUrl: 'https://www.site/adminterms.html',
        // TODO Privacy policy url.
        //privacyPolicyUrl: 'https://www.site/adminprivacy.html'
    };

    // show the container to login with
    document.getElementById('firebase_login_container').style.display = null;

    // Initialize the FirebaseUI Widget using Firebase.
    if(firebaseui.auth.AuthUI.getInstance()) {
        const ui = firebaseui.auth.AuthUI.getInstance();
        ui.start('#firebase_login_container', uiConfig);
    } else {
        const ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebase_login_container', uiConfig);	
    }
}

function updateFirebaseUserDisplay(user) {
    // update the dispay according the user being logged on or not
    var signIn = document.getElementById('firebaseSignIn');
    var signedIn = document.getElementById('firebaseSignedIn');
    if (signIn && signedIn) {
        if (user) {
            // User is signed in.
            signIn.style.display = 'none';
            signedIn.style.display = null;
            signedIn.innerHTML  = '<a href="profile.html">' + sanitizeHTML(user.displayName) + '</a>';
            console.log('user ' + user.displayName + " logged in");
        } else {
            // No user is signed in.
            signIn.style.display = null;
            signedIn.style.display = 'none';
            console.log('no user logged in');
        }
    }
    // update user role details
    updateFirebaseUserItems(user);
}

function initialiseFirebaseLoginButton() {
    // setup the login button properly
    var signIn = document.getElementById('firebaseSignIn');
    var signedIn = document.getElementById('firebaseSignedIn');
    if (signIn && signedIn) {
        signIn.style.display = 'none';
        signedIn.style.display = 'none';
        firebase.auth().onAuthStateChanged(function(user) {
            // update the display of the user here
            updateFirebaseUserDisplay(user);
            // dispatch this change to the document
            document.dispatchEvent(new Event('firebaseuserchange'));
        });
    }
};

function showFirebaseLoginButtons(user, userData) {
    // get if the user is an admin
    var isAdmin = firebaseData.isUserAdmin(userData);
    // and update the buttons accordingly
    updateMenuButtons(user, isAdmin);
}

function removeFirebaseLoginButtons() {
    // remove all the coaching options
    updateMenuButtons(null, false, false);
}

function updateMenuButtons(user, isAdmin) {
    // update the sign in buttons on the menu
    var signIn = document.getElementById('firebaseSignIn');
    var signedIn = document.getElementById('firebaseSignedIn');
    if (signIn && signedIn) {
        if (user) {
            // User is signed in.
            signIn.style.display = 'none';
            signedIn.style.display = null;
            signedIn.innerHTML  = '<a href="profile.html">' + sanitizeHTML(user.displayName) + '</a>';
        } else {
            // No user is signed in.
            signIn.style.display = null;
            signedIn.style.display = 'none';
        }
    }
    // and admin if we are admin
    var adminItems = document.getElementsByClassName("menu_admin");
    for (var i = 0; i < adminItems.length; i++) {
        if (isAdmin) {
            adminItems[i].style.display = null;
        }
        else {
            adminItems[i].style.display = 'none';
        }
    }
    // the drop-down menu is different though - we lost all our ids so we have to find them by hand
    var dropDownMenus = document.getElementsByClassName('nav_menu_buttons');
    if (dropDownMenus && dropDownMenus.length === 1) {
        var dropDownItems = dropDownMenus[0].getElementsByClassName("link");
        var isHidingBelow = false;
        for (var i = 0; i < dropDownItems.length; ++i) {
            if (dropDownItems[i].classList.contains('depth-0')) {
                // by default, we are not hiding this
                isHidingBelow = false;
                dropDownItems[i].style.display = null;
                // this is a top-level, is it the admin one
                if (dropDownItems[i].innerHTML.includes('Admin')) {
                    // this is admin
                    if (!isAdmin) {
                        dropDownItems[i].style.display = 'none';
                        isHidingBelow = true;
                    }
                }
                else if (dropDownItems[i].innerHTML.includes('Log In...')) {
                    // this is the log in button
                    if (user) {
                        dropDownItems[i].innerHTML = dropDownItems[i].innerHTML.replace('Log In...', sanitizeHTML(user.displayName));
                        dropDownItems[i].href = 'profile.html';
                        isHidingBelow = true;
                    }
                }
            }
            else if (isHidingBelow) {
                // hide this, it's below a top-level one we want to hide
                dropDownItems[i].style.display = 'none';
            }
            else {
                // show it then
                dropDownItems[i].style.display = null;
            }
        }
    }
}
    
function updateFirebaseUserItems (user) {
    // show the extra buttons when logging in changes
    if (user) {	
        firebaseData.getUserData(user, function(userData) {
            // we have the data, display the coaching things if we are a coach
            showFirebaseLoginButtons(user, userData);
        },
        function(error) {
            console.log("Failed to get the user data;", error);
            // failed to get the data
            removeFirebaseLoginButtons();
        })
    }
    else {
        // not logged in
        removeFirebaseLoginButtons();
    }
}

/*!
 * Sanitize and encode all HTML in a user-submitted string
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String} str  The user-submitted string
 * @return {String} str  The sanitized string
 */
var sanitizeHTML = function (str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};


const firebaseData = {

    lcRef : function (str) {
        if (!str) {
            return str;
        }
        else {
            // remove all spaces and make it lowercase
            str = str.toLowerCase().replace(/\s/g,'');
            // and get rid of anything too weird
            str = str.replace(/\W/g, '');
            if (str.length > 1 && str.slice(-1) === 's') {
                // remove any trailing 's' characters
                str = str.slice(0, -1);
            }
            return str;
        }
    },

    lcWords : function(str) {
        if (!str) {
            return [];
        }
        else {
            // make the words split from the string
            var words = [];
            var toProcess = str.toLowerCase().split(/\s/);
            for (var i = 0; i < toProcess.length; ++i) {
                // for each word from the string split, add it to the array
                var word = toProcess[i];
                words.push(firebaseData.lcRef(word));
                // and combine it with all following it
                for (var j = i + 1; j < toProcess.length; ++j) {
                    word += toProcess[j];
                    words.push(firebaseData.lcRef(word));
                }
            }
            // return all the words combined into a nice array of options to search for
            return words;
        }
    },

    getUser : function () {
        return firebase.auth().currentUser;
    },

    getUserData : function (user, onSuccess, onFailure) {
        // get the user data from firebase
        if (user && firebase) {
            // get the current UID and get the data in the store for this user
            var userUid = user.uid;
            var fData = this;
            // get the data for the user
            firebase.firestore().collection('users').doc(userUid).get()
            .then(function(doc) {
                if (doc && doc.exists) {
                    // do stuff with the data
                    onSuccess(doc.data());
                } else {
                    // log this
                    console.log("No document data exists for user", user);
                    // but let's fix it though
                    var newData = fData.createDefaultUserData(user);
                    onSuccess(newData);
                }
            })
            .catch(function(error) {
                onFailure ? onFailure(error) : console.log("Failed to get the document: ", error);
            });
        }
        else {
            // no firebase
            return null;
        }
    },

    createDefaultUserData : function (user) {
        var newUserData = {
            // setup the blank user data here
            name: user.displayName,
            name_lc: firebaseData.lcRef(user.displayName),
            email: user.email,
            email_lc: firebaseData.lcRef(user.email),
            isAdmin: false
        };
        firebase.firestore().collection('users').doc(user.uid).set(newUserData, {merge: true})
            .then(function() {
                // this worked
                console.log('added user data', user);
            })
            .catch(function(error) {
                // failed
                console.log("failed to create the user data", error);
            });
        return newUserData;
    },

    getUserProfiles : function (user) {
        user.providerData.forEach(function (profile) {
            console.log("Sign-in provider: " + profile.providerId);
            console.log("  Provider-specific UID: " + profile.uid);
            console.log("  Name: " + profile.displayName);
            console.log("  Email: " + profile.email);
            console.log("  Photo URL: " + profile.photoURL);
        });
    },

    updateUserData : function (user, userData, onSuccess, onFailure) {
        firebase.firestore().collection("users").doc(user.uid).update(userData)
        .then(function() {
            // this worked
            onSuccess ? onSuccess() : null;
        })
        .catch(function(error) {
            // this failed
            onFailure ? onFailure(error) : console.log("Failed to update the document: ", error);
        });
    },

    deleteAllUserData : function(user, onSuccess, onFailure) {
        // delete the user document we have stored
        firebase.firestore().collection("users").doc(user.uid).delete().then(function() {
            logout();
        }).catch(function(error) {
            alert("Sorry about this, but there was some error in removing all your data, please contact us to confirm all you data was in-fact removed. Please reference this weird set of letters to help us find it: '" + user.uid + "'." );
            console.error("Error removing document: ", error);
        });
    },
    
    isUserAdmin : function(firebaseUserData) {
        return firebaseUserData['isAdmin'];
    },
};