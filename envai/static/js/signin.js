
/// only logic here is essentially just toggling between sign in and sign up screen
// also handeles errors where password is wrong etc and turns borders red ... 


const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const pageValue = urlParams.get('mode'); 

const FRONTEND_SERVER = "http://localhost:5173/Dashboard"

var errorColor = "#da6058"
var nonErrorColor = "#858482"


function swap_display_states(el1, el2) {
    const temp = el1.style.display
    el1.style.display = el2.style.display
    el2.style.display = temp
}

function turn_borders_to_colour(list_of_el, colour) {
    list_of_el.forEach(el => {
        el.style.borderColor = colour;
    });
}


function clear_contents(list_of_el) {

    for (let i = 0; i < list_of_el.length; i++) {
        list_of_el[i].innerHTML = "";
    }
}

function handle_error_showing(elementsHtmlObject, action, error_message) {
    /// change borders to red
    turn_borders_to_colour(elementsHtmlObject, errorColor)

    /// display the error messaging div and place the corresponding message iside it
    if (action == 'signin') {
        document.getElementById('error_signin').style.display = "block";
        document.getElementById('error_message_1').innerHTML = error_message;

    }
    if (action == 'signup') {
        document.getElementById('error_signup').style.display = "block"
        document.getElementById('error_message_2').innerHTML = error_message
    }
}


function handele_error_hiding(elementsHtmlObject, action) {
    turn_borders_to_colour(elementsHtmlObject, nonErrorColor)
    /// display the error messaging div and place the corresponding message iside it
    if (action == 'signin') {
        document.getElementById('error_signin').style.display = "none"
        document.getElementById('error_message_1').innerHTML = "";
    }
    if (action == 'signup') {
        document.getElementById('error_signup').style.display = "none"
        document.getElementById('error_message_2').innerHTML = ""
    }
}


document.addEventListener("DOMContentLoaded", () => {
    /// get blocks that correspond to the sign in blocks and sign up blocks

    /// blocks of whole signin and signout content
    const signinBlock = document.getElementById('signin-block')
    const signupBlock = document.getElementById('signup-block')

    /// error message blocks
    const errorMesssageSignIn = document.getElementById('error_signin')
    const errorMessageSignUp = document.getElementById('error_signup')

    /// all inputfeilds elelements 
    ///sign in feilds
    const emailSignIn = document.getElementById('email_signin')
    const passwordSignIn = document.getElementById('password_signin')
    const signinArray = [emailSignIn, passwordSignIn]
    ///sign up feilds
    const emailSignUp = document.getElementById('email_signup')
    const nameSignUp = document.getElementById('name_signup')
    const password1SignUp = document.getElementById('password_signup')
    const password2SignUp = document.getElementById('password_signup_rewrite')
    const signupArray = [emailSignUp, nameSignUp, password1SignUp, password2SignUp]


    ///error wrappers
    const error_wrappers = document.getElementsByClassName("error_wrapper")
    const title = document.getElementById('title')
    const vid = document.getElementById('video').play();

    /// user is in signin section
    if (pageValue == "signin") {
        signinBlock.style.display = "block"
        signupBlock.style.display = "none"
        title.textContent = "Sign in"
    }
    else {
        signinBlock.style.display = "none"
        signupBlock.style.display = "block"   
        title.textContent = "Create account"
    }

    document.getElementById('create-account').addEventListener('click', () => {
        swap_display_states(signinBlock, signupBlock)
        title.textContent = "Create account"

        // remove all error text if it was there otherwise this does nothing
        handele_error_hiding(signinArray, 'signin')

         // change title of page and url
        title.textContent = "Sign up"
        history.pushState({}, "", "/auth/?mode=signup");
        
    })
    document.getElementById('signin-account').addEventListener('click', () => {
        swap_display_states(signinBlock, signupBlock)

        handele_error_hiding(signupArray, 'signup')

        // change title of page and url
        title.textContent = "Sign in"
        history.pushState({}, "", "/auth/?mode=signin");
    })

    /// forms
    form1 = document.getElementById('form1')
    form2 = document.getElementById('form2')

    form1.addEventListener('submit', (e) =>{
        /// stops from page reloading when user presses submit
        e.preventDefault()
        if (!form1.checkValidity()) {
            form1.reportValidity()
            return
        }

        handle_submit_form('signin')
    })

    form2.addEventListener('submit', (e) =>{
        /// stops from page reloading when user presses submit
        e.preventDefault();

        if (!form2.checkValidity()) {
            form2.reportValidity()
            return
        }

        handle_submit_form('signup')
    })


    const handle_submit_form = async (action) => {
        var csrfToken = document.getElementById('csrf-token').value;
    

        if (action == "signin") {
            body = JSON.stringify({
                action: "signin",
                email: emailSignIn.value,
                password: passwordSignIn.value
            })}
        else {
            body = JSON.stringify({
                action: "signup",
                name: nameSignUp.value,
                email: emailSignUp.value,
                password1: password1SignUp.value,
                password2: password2SignUp.value
            })
        }


        const response = await fetch("/auth/", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: body,
        });
        if (!response.ok) {
            const data = await response.json();
            let error_message = data.error;

            if (action == 'signin') {
                handle_error_showing(signinArray, action, error_message)
            }
            else {
                handle_error_showing(signupArray, action, error_message)
            }
        }
        else {
            window.location.href = FRONTEND_SERVER;
        }
    }

})




