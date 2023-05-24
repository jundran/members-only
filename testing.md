# Testing
All the following checks should pass:

## User not logged in
1. Can see messages but not authors or dates.
2. Cannot see options to post, edit or delete messages.
3. Cannot GET update form for message or user.
4. Cannot POST update form for message or user.
5. Cannot see profile on home page.

## Regular user - logged in
1. Can see all messages but only author and date fields for their own posts.
2. Can see option to post and to edit or delete messages that they own.
3. Cannot GET update form for message of another user.
4. Cannot POST update form for message of another user.
5. Can see their profile on home page.

## Premium user - logged in
1. Can see all messages and who posted them and when.
2. Can see option to post and to edit or delete messages that they own.
3. Cannot GET update form for message of another user.
4. Cannot POST update form for message of another user.
5. Can see their profile on home page.

## Account creation and profile update
1. Firstname, surname and email must not be blank.
2. Email must be in a valid format.
3. Email must be unique when creating a new account.
4. Password must not contain whitespace.
5. Password must be at least 8 characters.
6. Password must match password confirm.
7. Membership code must be valid or blank.
8. Admin code must be valid or blank.

## Authorization
1. Non-admin user cannot edit another user's post.
2. Non-admin user cannot delete another user's post.

## Model pre save
1. Message title is capitalized
2. First name is capitalized
3. Surname is capitalized
4. Membership status is Premium when admin code is entered
