var FB_URL = "https://slacktravel-test.firebaseio.com/items/";

var FB_URL = "https://slacktravel-test.firebaseio.com/items";

class ListItems extends React.Component {

	constructor(props) {
		super(props);
		this.state = { items: [{".key": 'ddd', text:'test item'}], text: ''};
	}

	render () {

		var _this = this;
		var createItem = function(item, index) {
			return (
					<li key={ index }>{ item.text }
					<span
							onClick={ _this.props.removeItem.bind(null, item['.key']) }
							style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
					X
					</span>
					</li>
			);
		};
		return <ul>{ this.props.items.map(createItem) }</ul>;
	}
}

class List extends React.Component {

	constructor(props) {
		super(props);
		this.state = { items: [{".key": 'ddd', text:'test item'}], text: ''};
	}

	componentWillMount() {
		console.log('List will doMount');
	}

	componentDidMount () {
		console.log('List did doMount');

		this.fBase = new Firebase(FB_URL);

		this.fBase.limitToLast(25).on('value', function(dataSnapshot) {

			var items = [];
			dataSnapshot.forEach(function(childSnapshot) {

				var item = childSnapshot.val();
				item['.key'] = childSnapshot.key();
				items.push(item);

			}.bind(this));

			this.setState({ items: items});

		}.bind(this));
	}

	componentWillUnmount () {
		console.log('List will doUnmount');
		this.fBase.off();
	}

	componentWillReceiveProps(next) {
		console.log('List will receive props');
	}

	onChange (e) {
		console.log(e.target.value);
		this.setState({text: e.target.value});
	}

	removeItem (key) {
		//var fBase = new Firebase(FB_URL);
		this.fBase.child(key).remove();
	}

	handleSubmit (e) {

		e.preventDefault();
		console.log(this);
		if (this.state.text && this.state.text.trim().length !== 0) {
			this.fBase.push({
				text: this.state.text
			});
			this.setState({ text: ''});
		}

		//if (this.state.text && this.state.text.trim().length !== 0) {
		//	this.state.items.push({
		//		text: this.state.text
		//	});
		//	this.setState({ text: ''});
		//}
	}

	render () {
		return (
				<div>

					<ListItems items={ this.state.items } removeItem={ this.removeItem.bind(this) } />

					<form onSubmit={ this.handleSubmit.bind(this) }>
						<input onChange={ this.onChange.bind(this) } value={ this.state.text } />
						<button>{ 'Add? #' + (this.state.items.length + 1) }</button>
					</form>
				</div>
		);
	}
}

ReactDOM.render(<List />, document.getElementById('todoApp'));