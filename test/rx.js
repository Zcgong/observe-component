import React from 'react';
import {createRenderer} from 'react-addons-test-utils';
import assert from 'assert';
import Rx from 'rx';


describe('RxJS module', function () {
	describe('observeComponent', function () {
		const observeComponent = require('../src/rx').observeComponent;
		const shallowRenderer = createRenderer();

		it('should return a valid React component', function () {
			const Streamable = observeComponent('button', ['onClick']);
			shallowRenderer.render(<Streamable />);
			const result = shallowRenderer.getRenderOutput();

			assert.strictEqual(result.type, 'button', "is a button component");
		});

		it('should have an __eventStream property', function () {
			const Streamable = observeComponent('button', ['onClick']);
			assert.strictEqual(!!Streamable.__eventStream, true, "has __eventStream");
		});

		it('should have an onClick event handler', function () {
			const Streamable = observeComponent('button', ['onClick']);
			shallowRenderer.render(<Streamable />);
			const result = shallowRenderer.getRenderOutput();
			assert.strictEqual(!!result.props.onClick, true, "has onClick");
		});

		it('should emit a value on __eventStream when an event is triggered', function () {
			const Streamable = observeComponent('button', ['onClick']);
			shallowRenderer.render(<Streamable />);
			const result = shallowRenderer.getRenderOutput();

			Streamable.__eventStream.subscribe((e) => 
				assert.deepEqual(e, { type: 'onClick', event: 'test event' }, "onClick")
			);
			result.props.onClick('test event');
		});
	});

	describe('fromComponent', function () {
		const fromComponent = require('../src/rx').fromComponent;
		it('should return the __eventStream property set on an object', function () {
			const obj = {
				__eventStream: true
			};

			assert.strictEqual(fromComponent(obj), true, "__eventStream property");
		});

		it('if an array is supplied to the second argument, filter event names by members of array', function () {
			const __eventStream = Rx.Observable.create((observer) => {
				observer.onNext({type: 'onEvent1'});
				observer.onNext({type: 'onEvent2'});
				observer.onNext({type: 'onEvent2'});
				observer.onCompleted();
			});
			const obj = { __eventStream };

			const event2 = fromComponent(obj, ['onEvent2']);
			let count = 0;
			event2.subscribe(({type}) => {
				assert.strictEqual(type, 'onEvent2', "is onEvent2");
				count++;
			});
			assert.strictEqual(count, 2, "gets called twice");
		});
	});
});
