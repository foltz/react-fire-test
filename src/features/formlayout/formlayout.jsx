
// - http://jaysoo.ca/2015/06/09/react-contexts-and-dependency-injection/
class Form extends React.Component {
	/*
	 setup a cascading layout for labels and inputs:
	 labelLayout="xs-4 sm-6 etc"
	 inputLayout="xs-8 sm-6 etc"
	 */

	getValidator() {
		return "validarot";
	}
	getChildContext () {
		return {
			getValidator: this.getValidator
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


	//render() {
	//
	//	var children = React.Children.map(this.props.children, (child) => {
	//
	//		var labelLayout = child.props.labelLayout || this.props.labelLayout;
	//		var inputLayout = child.props.inputLayout || this.props.inputLayout;
	//
	//		return React.cloneElement(child, { labelLayout: labelLayout, inputLayout: inputLayout})
	//	});
	//	return (<div>{children}</div>);
	//}
	render() {
		return (<div>{this.props.children}</div>);
	}
}

Layout.childContextTypes = {
	labelLayout: React.PropTypes.string.isRequired,
	inputLayout: React.PropTypes.string.isRequired
};

class Field extends React.Component {

	render() {
		return (
				<div>
					<div>label: {this.context.labelLayout}</div>
					<div>input: {this.context.inputLayout}</div>
					<div>validator: {this.context.getValidator()}</div>
					<div>{this.props.children}</div>
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
		var { Panel } = ReactBootstrap;
		return (
				<Panel>

					<Form className="form-horizontal" ref="form">

						<Layout labelLayout="col-xs-2" inputLayout="col-xs-10">

							<Field type="email" label="Email" />
							<Field type="password" label="Password" />

							<Panel>
								<Layout labelLayout="col-xs-4" inputLayout="col-xs-8">
									<Field type="email" label="Email" />
									<Field type="password" label="Password" />
								</Layout>
								<hr/>
								<Field type="email" label="Email" />
								<Field type="password" label="Password" />

							</Panel>

						</Layout>

					</Form>

				</Panel>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));