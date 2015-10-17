
class Harness {

	constructor() {

		var FB_URL = "https://slacktravel-test.firebaseio.com/items/";

		var harness = this;
		this.fBase = new Firebase(FB_URL);

		this.fBase.limitToLast(25).on('value', function(list) {

			var items = [];
			list.forEach(function(rec) {

				var item = rec.val();
				item['.key'] = rec.key();
				items.push(item);

			});

			ReactDOM.render(<ListApp items={items} harness={harness} />, document.getElementById('todoApp'));
		});
	}

	unmount() { this.fBase.off() }


	addItem (text) { this.fBase.push({ text: text }) }
	removeItem (key) { this.fBase.child(key).remove() }

}


class ListApp extends React.Component {

	constructor(props) {

		super(props);

		this.repo = props.repo;
		this.state = { text: ''};
	}

	getHarness () { return this.repo }

	getItems () { return this.props.items }
	setItems(items) { this.props.items = items }

	getText () { return this.state.text }
	setText(text) { this.setState({text: text})}


	// --------------------------------------------------------------
	// - COMPONENT LIFECYCLE
	// --------------------------------------------------------------

	componentWillMount() {
		console.log('List will doMount');
	}

	componentDidMount () {
		console.log('List did doMount');
	}

	componentWillUnmount () {
		this.getHarness().doUnmount();
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

			this.getHarness().addItem(text);
			this.setText('');
		}
	}


	// --------------------------------------------------------------
	// - RENDER
	// --------------------------------------------------------------

	render () {

		var harness = this.getHarness();
		var items = this.getItems();
		var text = this.getText();

		function ListItems() {

			var createItem = (item, index) => (

				<li key={ index }>{ item.text }
					<span
							onClick={ harness.removeItem.bind(harness, item['.key']) }
							style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
					X!
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

//class ListItems extends React.Component {
//
//	render () {
//
//		var items = this.props.items;
//		var repo = this.props.repo;
//		var removeItem = repo.removeItem;
//
//		var createItem = (item, index) => (
//
//			<li key={ index }>{ item.text }
//			<span
//					onClick={ removeItem.bind(repo, item['.key']) }
//					style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
//			X
//			</span>
//			</li>
//		);
//
//		return <ul>{ items.map(createItem) }</ul>;
//	}
//}

new Harness();