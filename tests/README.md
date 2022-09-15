**Automated Testing**
Tests get ran by GitHub actions every time you commit to the repository or create a pull request.

**Manual Testing**
If you want to run these tests manually, checkout the code from GitHub, and then cd into tests and run the command `node tests`

**Test Results**
If the tests ran successfully, the last log line will be 

> Tests ran successfully

If the test failed, an error will be thrown with information about what happened.
Also if a test failed, the other tests in tests.js will not run.