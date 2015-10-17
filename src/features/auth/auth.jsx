
class AuthApi {

	constructor() {

		var FB_URL = "https://slacktravel-test.firebaseio.com/";
		this.fBase = new Firebase(FB_URL);
	}

	// --------------------------------------------------------------
	// - COMPONENT LIFECYCLE
	// --------------------------------------------------------------

	doMount(cb) {

		//this.fBase.limitToLast(25).on('value', function(list) {
		//
		//	var items = [];
		//	list.forEach(function(rec) {
		//
		//		var item = rec.val();
		//		item['.key'] = rec.key();
		//		items.push(item);
		//
		//	});
		//
		//	cb(items);
		//});
	}

	doUnmount() { this.fBase.off() }


	// --------------------------------------------------------------
	// - ACTIONS
	// --------------------------------------------------------------


	tryLogin (email, password, cb) {

		this.fBase.authWithPassword(

				{email: email, password: password},

				(error, authData) => {
					if (error) {
						console.log("Login Failed!", error);
					} else {
						console.log("Authenticated successfully with payload:", authData);
					}
					cb(error, authData);
				}
		);
	}
}


class LoginForm extends React.Component {

	constructor(props) {

		super(props);

		this.api = new AuthApi();
		this.state = { email: 'foltz@nzn.com', password: 'slUgoth'};
	}


	getApi () { return this.api }


	// --------------------------------------------------------------
	// - COMPONENT LIFECYCLE
	// --------------------------------------------------------------

	componentWillMount() {
		//console.log('LoginForm will mount');
	}

	componentDidMount () {
		//console.log('List did mount');
		//this.getApi().doMount((items) => this.setItems(items));
	}

	componentWillUnmount () {
		//this.getApi().doUnmount();
	}

	componentWillReceiveProps(next) {
		//console.log('List will receive props');
	}


	// --------------------------------------------------------------
	// - EVENT HANDLERS
	// --------------------------------------------------------------

	bindField (key) {
		return function (e) {

			var field = {};
			field[key] = e.target.value;
			this.setState(field);

		}.bind(this);
	}

	onSubmit (e) {

		e.preventDefault();

		var email = this.state.email;
		var password = this.state.password;

		this.getApi().tryLogin(email, password, (error, authData) => {
			// - handle error or successful login...
		});
	}


	// --------------------------------------------------------------
	// - RENDER
	// --------------------------------------------------------------

	render () {

		return (
				<div>
					<h3>Login:</h3>

					<form onSubmit={ this.onSubmit.bind(this) }>

						<input type="email"
						       onChange={ this.bindField("email") }
						       value={ this.state.email } />
						<br/>
						<input type="password"
						       onChange={ this.bindField("password") }
                               value={ this.state.password} />
						<br/>
						<input type="submit" value="Go!"/>
					</form>

				</div>
		);
	}
}

ReactDOM.render(<LoginForm />, document.getElementById('loginForm'));
console.log('auth api');