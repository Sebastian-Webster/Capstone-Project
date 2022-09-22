**Manual Testing of SebMedia**<br>
This is a list of instructions to do manual testing of SebMedia, and to make sure that everything is working properly.

**Signing up to SebMedia**<br>
Before people can use SebMedia, they must signup and create a SebMedia account. In order to test to make sure that users can signup and make their own accounts, follow these steps

 1. Open SebMedia
 2. Press the `Don't have an account? Signup` button
 3. Enter a username, email, and password
 4. Press signup

Keep in mind that when signing up, the information entered must meet these requirements:

 - Username must be between 1 and 20 characters long
 - Username must only have alphabet letters (a-z or A-Z) and numbers (0-9)
 - Username must not be the same as a different user's username
 - Email must be a valid format (`string`@`string`.`2 - 4 character long string`)
 - Email must not be the same as a different user's email
 - Password must be between 8 and 18 characters long (lower limit is enforced for user security reasons, upper limit is enforced because of `bcrypt` limitations)

The test succeeded if:

 1. When the information entered does not meet the requirements set above, an error is shown and the new user does not get created
 2. When the information entered is correct and meets the requirements set above, the new user gets created and you get logged in and taken to the home screen

Otherwise if both of those two passing requirements were not met, the test has failed.

**Logging into SebMedia**<br>
Before you can use SebMedia, you must be logged into your account. To test that logging in works correctly, follow these steps

 1. Open SebMedia
 2. Enter your email and password
 3. Press sign in

Keep in mind that before starting the test, you must have to already have a SebMedia account created

The test succeeded if:

 1. When wrong information was entered (wrong password for an account, or email that doesn't associate with a user) you do not get logged in and an error is displayed
 2. When correct information is entered (correct password and email for an account that exists on SebMedia) you get logged in and taken to the home screen

Otherwise if both of those two passing requirements were not met, the test has failed.

**Finding users' profiles - Search Screen**<br>
In order to test to make sure that the Search Screen is working properly, follow these steps

 1. Open SebMedia
 2. Login/Signup
 3. Press the search icon at the top of the screen (magnifying glass)
 4. In the search box, type in a user's profile name
 
If the test succeeded, you will see the user's profile (their name and profile picture in a rectangle)

If the test has failed, you will not see the user's profile.

**Following a friend - Following users**<br>
In order to test to make sure that you can follow users, follow these steps

 1. Open SebMedia
 2. Login/Signup
 3. Press the search icon at the top of the screen (magnifying glass)
 4. In the search box, type the profile name of the user you want to follow
 5. Press on their profile when it comes up
 6. Press the `follow` button (if the user already follows you, the `follow` button will instead be a `follow back` button)
 7. Go to your profile (press on your profile picture at the top of the screen) - the button is in between the `search (magnifying glass)` and `+ (create post)` buttons
 8. Press on `following` (inline with followers and your profile name and picture)
 
If the user you just followed is showing up in the following screen, the test succeeded. If not, the test failed.

**Creating a post - Post Screen**<br>
In order to test to make sure that you can upload your own posts, follow these steps

 1. Open SebMedia
 2. Login/Signup
 3. Press the + icon at the top of the screen
 4. Enter a title and body
 5. If you want to add an image, press the `+ IMAGE` button
 6. If you want to change the image, press the `CHANGE IMAGE` button
 7. If you want to remove the image, press the `REMOVE IMAGE` button
 8. Press the submit button
 9. Press the profile button at the top of the screen (your profile picture) - the button is in between the `search (magnifying glass)` and `+ (create post)` buttons
 10. If the post had an image, press the `IMAGE POSTS` button

If you can see the post you have just created, the test succeeded. If not, the test failed.

**Editing a post**<br>
In order to test that you can edit posts, follow these steps

 1. Open SebMedia
 2. Login/Signup
 3. Press the profile button at the top of the screen (your profile picture) - the button is in between the `search (magnifying glass)` and `+ (create post)` buttons
 4. If you want to edit an image post, press `IMAGE POSTS`
 5. Find the post you want to edit, and press the 3 dots `...`
 6. In the dropdown menu, press `Edit`
 7. Make the edits that you want to make
 8. Press the save button
 9. Reload the page
 10. Find the post again

If the post has the new edits, the test has succeeded. If the post has not updated, then the test has failed.