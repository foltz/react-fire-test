
class BsForm extends React.Component {

	constructor(props) {

		super(props);

		this.state = { email: 'foltz@nzn.com', password: 'slUgoth'};
	}


	//getApi () { return this.api }


	// --------------------------------------------------------------
	// - COMPONENT LIFECYCLE
	// --------------------------------------------------------------

	componentWillMount() {
		//console.log('LoginForm will mount');
	}

	componentDidMount () {
		//console.log('List did mount');
		//this.getApi().doMount((items) => this.setItems(items));
		var v = $(this.refs.form).validator();
		v.on('validate.bs.validator', (e) => {
			console.log('validator: ', e);
		});

		v.on('invalid.bs.validator', (e) => {
			console.log('IN-valid!!!: ', e);
		});

		v.on('valid.bs.validator', (e) => {
			console.log('valid!!!: ', e);
		});

	}

	componentWillUnmount () {
		//this.getApi().doUnmount();
		$(this.refs.form).validator('destroy');
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

		//var email = this.state.email;
		//var password = this.state.password;
		//
		//this.getApi().tryLogin(email, password, (error, authData) => {
		//	// - handle error or successful login...
		//});
	}


	// --------------------------------------------------------------
	// - RENDER
	// --------------------------------------------------------------

	render () {
		//
		//var ButtonToolbar = ReactBootstrap.ButtonToolbar;
		//var Button = ReactBootstrap.Button;
		//var Button = ReactBootstrap.Button;
		var { ButtonToolbar, Button, Panel, Input } = ReactBootstrap;
		return (
				<Panel>

					<Panel>
						<ButtonToolbar>
							{/* Standard button */}
							<Button>Default</Button>

							{/* Provides extra visual weight and identifies the primary action in a set of buttons */}
							<Button bsStyle="primary">Primary</Button>

							{/* Indicates a successful or positive action */}
							<Button bsStyle="success">Success</Button>

							{/* Contextual button for informational alert messages */}
							<Button bsStyle="info">Info</Button>

							{/* Indicates caution should be taken with this action */}
							<Button bsStyle="warning">Warning</Button>

							{/* Indicates a dangerous or potentially negative action */}
							<Button bsStyle="danger">Danger</Button>

							{/* Deemphasize a button by making it look like a link while maintaining button behavior */}
							<Button bsStyle="link">Link</Button>
						</ButtonToolbar>
					</Panel>

					<Panel>
						<form className="form-horizontal" ref="form">

							<Input type="email" label="Email" help={<div>test</div>}
							       labelClassName="col-xs-2" wrapperClassName="col-xs-10"
							       data-error="Bruh, that email address is invalid" required/>

							<Input type="text" bsStyle="success" label="Success" hasFeedback
							       labelClassName="col-xs-2" wrapperClassName="col-xs-10"/>

							<Input type="text" bsStyle="warning" label="Warning" hasFeedback
							       labelClassName="col-xs-2" wrapperClassName="col-xs-10"/>

							<Input type="text" bsStyle="error" label="Error" hasFeedback
							       labelClassName="col-xs-2" wrapperClassName="col-xs-10"/>

						</form>
					</Panel>

				</Panel>
		);
	}
}

ReactDOM.render(<BsForm />, document.getElementById('bsForm'));