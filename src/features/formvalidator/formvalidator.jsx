
validator.extend('minLength', (val, min) =>  validator.isLength(val, min));
validator.extend('maxLength', (val, max) =>  validator.isLength(val, 0, max));

validator.extend('confirmPass', (val, passFieldName, ctx) => {

	return val == ctx.validator.getField(passFieldName).getValue();
});

validator.extend('serverFake', (val, url, ctx) => {

	return (cb) => {
		setTimeout(function() {
			cb(false);
			//var msg = ctx.validator.getMessage(ctx.fieldName, ctx.ruleName);
			//ctx.validator.getField(ctx.fieldName).showAsInvalid(msg);

		}, 1000);
	};
});

class Validator {

	constructor(options) {

		this.fields = {};

		this.messages = options.messages || {};

		this.defaultMessages = {

			"isEmail": () => "Please enter a valid email",
			"password.minLength" : (min) => `Your password must be at least ${min} characters`,
			"minLength" : (min) => `At least ${min} characters`,
			"maxLength" : (max) => `No longer than ${max} characters`,
			"confirmPass" : () => "This does not match your password",
			"serverFake" : () => "Fake server error"
		}
	}

	getMessage(fieldName, ruleName, ruleParam) {

		let longKey = fieldName + "." + ruleName;
		let shortKey = ruleName;

		if (this.messages[longKey] != null) return this.messages[longKey](ruleParam);
		if (this.messages[shortKey] != null) return this.messages[shortKey](ruleParam);

		if (this.defaultMessages[longKey] != null) return this.defaultMessages[longKey](ruleParam);
		if (this.defaultMessages[shortKey] != null) return this.defaultMessages[shortKey](ruleParam);

		return "No message specified: " + ruleName;
	}

	registerField(fieldComponent) {
		var fieldName = fieldComponent.getName();
		if (fieldName)
			this.fields[fieldName] = fieldComponent;
	}
	unregisterField(fieldComponent) {
		delete this.fields[fieldComponent.getName()];
	}

	listFields() {
		return this.fields;
	}
	getField(fieldName) {
		return this.fields[fieldName];
	}

	validateField(fieldName, fieldVal, ruleList, cb) {

		var self = this;
		console.log(validator);

		var rules = ruleList.trim().match(/[^ ]+/g);

		var awaitingAsync = false;
		// - TODO: come up with a better/cleaner approach (PROMISES?)
		// - in the mean time, the async should always be the last thing called...
		// - and used in simple scenarios...

		for(let i = 0; i < rules.length; i++) {

			let rule = rules[i],  ruleName = null, ruleParam = null;

				[ruleName, ruleParam] = rule.split(":");


			let ctx = {
				validator: self, fieldName: fieldName,
				ruleName: ruleName, ruleParam: ruleParam
			};

			let validateRule = validator[ruleName](fieldVal, ruleParam, ctx);
			let message = this.getMessage(fieldName, ruleName, ruleParam);

			if (typeof validateRule === 'function') {

				awaitingAsync = true;
				self.getField(fieldName).showAsClean();

				validateRule((isValid) => {

					if (isValid) {
						cb({success: true});
					} else {
						//var msg = self.getMessage(fieldName, ruleName, ruleParam);
						//self.getField(fieldName).showAsInvalid(msg);

						cb({success: false, fieldName:fieldName, ruleName:ruleName, message:message });

					}
				});

			}
			else if (validateRule === false) {

				//let fieldName = field.getName();
				//let message = this.getMessage(fieldName, ruleName, ruleParam);

				cb({success: false, fieldName:fieldName, ruleName:ruleName, message:message });
				return;
			}

		}
		if (!awaitingAsync) {
			console.log('call back: success = true')
			cb({success: true});
		}
		return;
	}
}


// - http://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/
class Form extends React.Component {

	constructor(props) {
		super(props);
		this.validator = props.validator || new Validator();
		console.log('init validator', this.validator);

	}

	getChildContext () {
		return {
			withValidator: this.withValidator.bind(this)
		}
	}

	withValidator(fnToRun) {
		var validator = this.validator;
		if (validator) fnToRun(validator);
	}

	onSubmit(e) {

		e.preventDefault();
		console.log('submit');

		this.withValidator((validator) => {

			var isValid = true;
			for(var fieldName in validator.listFields()) {
				var field = validator.getField(fieldName);
				if (!field.canSubmit()) {
					console.log('INVALID!!!!', fieldName);
					isValid = false;
				}
			}
			console.log('CAN SUBMIT???', isValid);
		});
	}

	onReset(e) {

		console.log('reset');

		this.withValidator((validator) => {

			for(var fieldName in validator.listFields()) {
				validator.getField(fieldName).showAsClean();
			}
		});
	}

	render() {
		return (
				<form onSubmit={this.onSubmit.bind(this)}
				      onReset={this.onReset.bind(this)}

										{...this.props}>

					{this.props.children}
				</form>
		);
	}
}

Form.childContextTypes = {
	withValidator: React.PropTypes.func.isRequired
};

class Layout extends React.Component {
	/*
	setup a cascading layout for labels and inputs:
	labelLayout="xs-4 sm-6 etc"
	inputLayout="xs-8 sm-6 etc"
	*/

	getChildContext () {
		return {
			labelLayout: this.props.labelLayout,
			inputLayout: this.props.inputLayout
		}
	}

	render() {
		return (<div className="layout-component">{this.props.children}</div>);
	}
}

Layout.childContextTypes = {
	labelLayout: React.PropTypes.string.isRequired,
	inputLayout: React.PropTypes.string.isRequired
};

class Field extends React.Component {

	constructor(props) {
		super(props);
		this.state = {value: props.value || '', message: '', showAs: 'clean'};
	}
	getName() { return this.props.name }
	getValue() { return this.state.value }

	setMessage(msg) { this.setState({message: msg}) }

	getShowAs() { return this.state.showAs }
	setShowAs(showAs) { this.setState({showAs: showAs}) }

	withValidator(fnToRun) {

		this.context.withValidator(fnToRun);
		//var validator = this.context.getValidator();
		//if (validator) fnToRun(validator);
	}

	tryValidation(fieldVal, ruleAttrs) {

		this.showAsClean();
		//console.log('rule attrs: ', ruleAttrs);

		var ruleList = ruleAttrs.filter(n => n != undefined);
		//console.log('rule list - filter: ', ruleList);
		ruleList = ruleList.join(' ');
		//console.log('rule list - join: ', ruleList);

		if (!ruleList) return true;



		var fieldName = this.getName();

		var isValid = true;
		this.withValidator((validator) =>
				validator.validateField(fieldName, fieldVal, ruleList, (result) => {
					console.log("RESUOLT", result);

					if (result.success) {
						console.log('isValid - showAsValid');
						this.showAsValid();
					}
					else {
						isValid = false;
						this.showAsInvalid(result.message);
					}
				})
		);

		return isValid; // - only used during submit....
	}

	showAsClean() {
		this.setMessage("");
		this.setShowAs('clean');
	}

	showAsValid() {
		this.setMessage("");
		this.setShowAs('valid');
	}

	showAsInvalid(msg) {
		this.setMessage(msg);
		this.setShowAs('invalid');
	}



	componentDidMount () {
		this.withValidator((validator) => validator.registerField(this))
	}
	componentWillUnmount() {
		this.withValidator((validator) => validator.unregisterField(this))
	}

	onChange(e) {

		var fieldVal = e.target.value;
		this.setState({value: fieldVal});

		var ruleList = [this.props.validateOnChange];
		this.tryValidation(fieldVal, ruleList);
	}

	onBlur(e) {

		var fieldVal = e.target.value;
		//this.setState({value: fieldVal});

		var p = this.props;
		var ruleList = [p.validateOnBlur, p.validateOnChange];

		this.tryValidation(fieldVal, ruleList);
	}

	canSubmit() { // - event is triggered by form....

		var fieldVal = this.state.value;

		var p = this.props;
		var ruleList = [p.validateOnSubmit, p.validateOnBlur, p.validateOnChange];

		return this.tryValidation(fieldVal, ruleList);
	}


	render() {

		var feedbackIconClass = () => {

			var icon = null;

			switch(this.getShowAs()) {

				case 'valid': icon = "glyphicon-ok"; break;
				case 'invalid': icon = "glyphicon-remove"; break;
				//default: icon = "glyphicon-warning-sign"; break;
			}
			return classNames("glyphicon form-control-feedback", icon);
		};

		var feedbackGroupClass = () => {

			var icon = null;

			switch(this.getShowAs()) {

				case 'valid': icon = "has-success"; break;
				case 'invalid': icon = "has-error"; break;
				//default: icon = "has-warning"; break;
			}
			return (icon) ? classNames("has-feedback", icon) : "";
		};

		return (
				<div className={classNames("form-group", feedbackGroupClass())}>

					<label className={classNames("control-label", this.context.labelLayout)}>
						<span>{this.props.label}</span>
					</label>

					<div className={this.context.inputLayout}>

						<input className="form-control"
						       onChange={this.onChange.bind(this)}
						       onBlur={this.onBlur.bind(this)}
						       value={this.state.value} {...this.props} />

						<span className={feedbackIconClass()}></span>

						<div className="help-block">
							<div>{this.state.message}</div>
						</div>
					</div>

				</div>
		)
	}
}

Field.contextTypes = {

	withValidator: React.PropTypes.func.isRequired,

	labelLayout: React.PropTypes.string.isRequired,
	inputLayout: React.PropTypes.string.isRequired
};

function TestElement(props) {
	return <div>Test element:{props.val}</div>
}
class App extends React.Component {


	render () {

		var formValidator = new Validator({});

		var { ButtonInput, Panel, Button, ButtonToolbar } = ReactBootstrap;
		return (
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

					<TestElement val="wah?!?!" />
					<Form method="post" className="form-horizontal" ref="form" validator={formValidator}>

						<Layout labelLayout="col-xs-4 col-sm-2" inputLayout="col-xs-8 col-sm-10">

							<Panel>

								<Field name="company" type="text" label="Company"
								       validateOnBlur="minLength:3"
								/>

								<Field name="fake" type="text" label="Handle"
								       validateOnChange="serverFake" />

							</Panel>

							<Panel>

								<Layout labelLayout="col-xs-4" inputLayout="col-xs-8">

									<Field name="email2" type="text" label="Email Two"
									       validateOnChange="isEmail"/>

									<Field name="password2" type="password" label="Password Two"
									       validateOnChange="minLength:3 maxLength:6"/>

									<Field name="confPass" type="password" label="Confirm Password Two"
									       validateOnChange="confirmPass:password2"/>

								</Layout>

							</Panel>



							<Panel>
								<Field type="email" label="Email Three" />
								<Field type="password" label="Password Three" />
							</Panel>

						</Layout>

						<ButtonToolbar>
							<div className="col-sm-6">
								<ButtonInput type="reset" value="Reset Button"
								             className="col-xs-offset-3 col-xs-6"
								             bsStyle="danger"/>
							</div>
							<div className="col-sm-6">
								<ButtonInput type="submit" value="Submit Button"
								             className="col-xs-offset-3 col-xs-6"
								             bsStyle="success"/>
							</div>

						</ButtonToolbar>
					</Form>

				</Panel>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));