
validator.extend('minLength', (str, min) =>  validator.isLength(str, min));
validator.extend('maxLength', (str, max) =>  validator.isLength(str, 0, max));

class Validator {

	constructor(options) {

		this.messages = options.messages || {};

		this.defaultMessages = {

			"isEmail": () => "Please enter a valid email",
			"password.minLength" : (min) => `Your password must be at least ${min} characters`,
			"maxLength" : (max) => `No longer than ${max} characters`
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

	validateField(field, value, cb) {

		console.log('change', value);

		console.log('validate field:', field);

		let rules = field.props.validate.trim().match(/[^ ]+/g); //  .split(/(\s+)/g);
		console.log("rules: ", rules);
		for(let i = 0; i < rules.length; i++) {

			let rule = rules[i], ruleName = null, ruleParam = null;
			[ruleName, ruleParam] = rule.split(":");
			console.log("rule name: ", ruleName);
			if (!validator[ruleName](value, ruleParam)) {

				let fieldName = field.getName();
				let message = this.getMessage(fieldName, ruleName, ruleParam);

				cb({success: false, fieldName:fieldName, ruleName:ruleName, message:message });
				return;
			}

		}

		cb({success: true});
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
	getValidator() {
		console.log('get validator', this.validator);
		return this.validator
	}
	getChildContext () {
		return {
			getValidator: this.getValidator.bind(this)
		}
	}

	render() {
		return (<form>{this.props.children}</form>);
	}
}

Form.childContextTypes = {
	getValidator: React.PropTypes.func.isRequired
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
		return (<div>{this.props.children}</div>);
	}
}

Layout.childContextTypes = {
	labelLayout: React.PropTypes.string.isRequired,
	inputLayout: React.PropTypes.string.isRequired
};

class Field extends React.Component {

	constructor(props) {
		super(props);
		this.state = {value: props.value || '', message: ''};
	}
	getName() {
		return this.props.name
	}
	getValue() {
		return this.state.value
	}
	setMessage(msg) {
		this.setState({message: msg})
	}
	
	onChange(e) {

		var value = e.target.value;
		this.setState({value: value});

		this.context.getValidator().validateField(this, value, (result) => {
			this.setMessage((result.success) ? "" : result.message);
			console.log("result", result);
		});

	}
	render() {
		return (
				<div className="form-group">

					<label className={classNames("control-label", this.context.labelLayout)}>
						<span>{this.props.label}</span>
					</label>

					<div className={this.context.inputLayout}>
						<input className="form-control" onChange={this.onChange.bind(this)} value={this.state.value} {...this.props} />
							<span className="help-block">
								<div>{this.state.message}</div>
							</span>
					</div>

				</div>
		)
	}
}

Field.contextTypes = {

	getValidator: React.PropTypes.func.isRequired,

	labelLayout: React.PropTypes.string.isRequired,
	inputLayout: React.PropTypes.string.isRequired
};

class App extends React.Component {


	render () {

		var formValidator = new Validator({});

		var { Panel } = ReactBootstrap;
		return (
				<Panel>

					<Form className="form-horizontal" ref="form" validator={formValidator}>

						<Layout labelLayout="col-xs-2" inputLayout="col-xs-10">

							<Panel>

								<Field name="email" label="Email"
								       validate="isEmail"/>

								<Field name="password" type="password" label="Password"
								       validate="minLength:3 maxLength:6" />

							</Panel>

							<Panel>

								<Layout labelLayout="col-xs-4" inputLayout="col-xs-8">

									<Field type="email" label="Email Two" />
									<Field type="password" label="Password Two" />

								</Layout>

							</Panel>

							<div className="col-xs-4"></div>

							<Panel className="col-xs-8">
								<Field type="email" label="Email Three" />
								<Field type="password" label="Password Three" />
							</Panel>

						</Layout>

					</Form>

				</Panel>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));