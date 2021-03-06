var FB_URL = "https://slacktravel-test.firebaseio.com/items/";

var TodoList = React.createClass({
	render: function() {
		var _this = this;
		var createItem = function(item, index) {
			return (
				<li key={ index }>
				{ item.text }
			<span onClick={ _this.props.removeItem.bind(null, item['.key']) }
			style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
			X
			</span>
			</li>
			);
		};
		return <ul>{ this.props.items.map(createItem) }</ul>;
	}
});

var TodoApp = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			items: [],
			text: ''
		};
	},

	componentWillMount: function() {

		console.log('comp will doMount');
		var firebaseRef = new Firebase(FB_URL);
		this.bindAsArray(firebaseRef.limitToLast(25), 'items');
	},

	componentDidMount: function() {
		console.log('comp did doMount');
	},

	onChange: function(e) {
		//console.log(e.target.value);
		this.setState({text: e.target.value});
	},

	removeItem: function(key) {
		var firebaseRef = new Firebase(FB_URL);
		firebaseRef.child(key).remove();
	},

	handleSubmit: function(e) {
		e.preventDefault();
		if (this.state.text && this.state.text.trim().length !== 0) {
			this.firebaseRefs['items'].push({
				text: this.state.text
			});
			this.setState({
				text: ''
			});
		}
	},

	render: function() {
		return (
			<div>
			<TodoList items={ this.state.items } removeItem={ this.removeItem } />
		<form onSubmit={ this.handleSubmit }>
		<input onChange={ this.onChange } value={ this.state.text } />
		<button>{ 'Add #' + (this.state.items.length + 1) }</button>
		</form>
		</div>
		);
	}
});

ReactDOM.render(<TodoApp />, document.getElementById('todoApp'));