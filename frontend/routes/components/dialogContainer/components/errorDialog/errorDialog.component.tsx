import * as React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

interface IProps {
	method: string;
	dataType: string;
	message: string;
	status: string;
	handleResolve: () => string;
}
export const ErrorDialog = (props: IProps) => {
	const renderItems = (items) => {
		return items.map((item) => (<p>item</p>));
	};

	const description = `\
		User { {:: memberName } } has permissions assigned on the following items,\
		they will be removed together with the license. \
		Do you really want to remove this license?
	`;

	const { method, dataType, message, status } = props;
	return (
		<>
			<DialogContent>
				{ method && dataType ?
					`Something went wrong trying to ${method} the ${dataType}:` :
					`Something went wrong:`
				}

				<br /><br/>
				<strong>{ message }</strong>
				<br />
				{ status && (<code>(Status Code: {status})</code>) }
				<br /><br />
				If this is unexpected please message support@3drepo.io.
			</DialogContent>

			<DialogActions>
				<Button onClick={props.handleResolve} color="primary">Ok</Button>;
			</DialogActions>
		</>
	);
};