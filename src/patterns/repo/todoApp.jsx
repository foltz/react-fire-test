
class TodoRepo {

	constructor() {

		var FB_URL = "https://slacktravel-test.firebaseio.com/items/";
		this.fBase = new Firebase(FB_URL);
	}

	// --------------------------------------------------------------
	// - COMPONENT LIFECYCLE
	// --------------------------------------------------------------

	doMount(cb) {

		this.fBase.limitToLast(25).on('value', function(list) {

			var items = [];
			list.forEach(function(rec) {

				var item = rec.val();
				item['.key'] = rec.key();
				items.push(item);

			});

			cb(items);
		});
	}

	doUnmount() { this.fBase.off() }


	// --------------------------------------------------------------
	// - ACTIONS
	// --------------------------------------------------------------

	addItem (text) { this.fBase.push({ text: text }) }
	removeItem (key) { this.fBase.child(key).remove() }
}


class TodoComponent extends React.Component {

	constructor(props) {

		super(props);

		this.repo = new TodoRepo();
		this.state = { text: '', items: []};
	}


	getRepo () { return this.repo }

	getItems () { return this.state.items }
	setItems(items) { this.setState({items: items})}

	getText () { return this.state.text }
	setText(text) { this.setState({text: text})}


	// --------------------------------------------------------------
	// - COMPONENT LIFECYCLE
	// --------------------------------------------------------------

	componentWillMount() {
		console.log('List will mount');
	}

	componentDidMount () {
		console.log('List did mount');
		this.getRepo().doMount((items) => this.setItems(items));
	}

	componentWillUnmount () {
		this.getRepo().doUnmount();
	}

	componentWillReceiveProps(next) {
		console.log('List will receive props');
	}


	// --------------------------------------------------------------
	// - EVENT HANDLERS
	// --------------------------------------------------------------

	onChange (e) { this.setText(e.target.value); }

	onSubmit (e) {

		e.preventDefault();

		var text = this.getText();

		if (text && text.trim().length !== 0) {

			this.getRepo().addItem(text);
			this.setText('');
		}
	}


	// --------------------------------------------------------------
	// - RENDER
	// --------------------------------------------------------------

	render () {

		var repo = this.getRepo();
		var items = this.getItems();
		var text = this.getText();

		function ListItems() {

			var createItem = (item, index) => (

				<li key={ index }>{ item.text }
					<span
						onClick={ repo.removeItem.bind(repo, item['.key']) }
						style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
					X?
					</span>
				</li>
			);

			return <ul>{ items.map(createItem) }</ul>;
		}

		return (
				<div>

					<ListItems />

					<form onSubmit={ this.onSubmit.bind(this) }>
						<input onChange={ this.onChange.bind(this) } value={ text } />
						<button>{ 'Add? #' + (items.length + 1) }</button>
					</form>

				</div>
		);
	}
}

ReactDOM.render(<TodoComponent />, document.getElementById('todoApp'));