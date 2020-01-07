import { LightningElement, wire,track } from 'lwc';
import getAccountList from '@salesforce/apex/TaskController.getTaskList';
import getTaskListWithFilter from '@salesforce/apex/TaskController.getTaskListWithFilter';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import description from '@salesforce/schema/Task__c.Description__c';
import Name from '@salesforce/schema/Task__c.Name';
import ID_FIELD from '@salesforce/schema/Task__c.Id';
import status from '@salesforce/schema/Task__c.Status__c';
import Due_Date from '@salesforce/schema/Task__c.Due_Date__c';
import delSelectedCons from '@salesforce/apex/TaskController.deleteTasks';

const actions = [
    { label: 'Record Details', name: 'record_details'}, 
    { label: 'Edit', name: 'edit'}, 
    { label: 'Delete', name: 'delete'}
];

export default class Task extends LightningElement {
    @track data;
    @track error;
    @track picklistValue ='';
    @track str;
    @track record = [];
    @track sortBy;
    @track sortDirection ='asc';
    @track draftValues = [];
    @track bShowModal = false;
    @track currentRecordId;
    @track isEditForm = false;
    @track openmodel = false;
    @track showLoadingSpinner = false;
    @track taskRecord = {
        Name : Name,
        status : status,
        Due_Date : Due_Date,
        description : description
    };

    @track columns = [{
        label: 'Task name',
        fieldName: 'Name',
        type: 'text',
        sortable: true ,
        editable: true,
        cellAttributes: {
            "style": {
                "fieldName": "showClass"
            }
        },
        typeAttributes: {
            "label": {
                "fieldName": "Name"
            },
            target: null,
            rowActions: { label: 'View', name: 'view'},
        },
    },
    {
        label: 'Description',
        fieldName: 'Description__c',
        type: 'picklist',
        sortable: true, editable: true,
        cellAttributes: {
            "style": {
                "fieldName": "showClass"
            }
        },
    },
    {
        label: 'Status',
        fieldName: 'Status__c',
        type: 'text',
        sortable: true, editable: true,
        cellAttributes: {
            "style": {
                "fieldName": "showClass"
            }
        },
    }, 
    {
        label: 'Due Date',
        fieldName: 'Due_Date__c',
        type: 'date',
        sortable: true, editable: true,
        cellAttributes: {
            "style": {
                "fieldName": "showClass"
            }
        },
    },
    {
        type: 'action',
        typeAttributes: {
            rowActions: actions,
            menuAlignment: 'right'
        }
    }

];
    @wire(getAccountList , {str:null})
    wiredAccounts({ error, data }) {
        if (data) {

            var response = JSON.parse(data) ;
            var today = new Date();
            var tempDate = ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var tommorow =  ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
            console.log('Success' + response);
            console.log('today',today);
            console.log('tempDate',tempDate);
            console.log('tommorow',tommorow);
            // iterate each records with forEach loop
            response.forEach(function(record){ 
                if(typeof record.Id != 'undefined'){ 
                    var dueDate =  new Date(record.Due_Date__c);
                    console.log('dueDate',dueDate);
                    console.log('record.Due_Date__c',record.Due_Date__c);
                    // based on VIP Account field value set the icon and style class to each record mportant3
                    // https://www.lightningdesignsystem.com/icons/#utility 
                    if(record.Status__c  != 'Completed' && ( record.Due_Date__c ==  tempDate ||  record.Due_Date__c  == tommorow  )){
                        record.showClass = (record.Status__c != 'Completed' ? 'background-color:yellow !important;' : 'color:black !important;');
                        record.displayIconName = 'utility:check';   
                    }
                    else if ( record.Status__c  != 'Completed' &&  dueDate.getTime() < today.getTime()  ) {
                        record.showClass = (record.Status__c != 'Completed' ? 'background-color:red !important;' : 'color:black !important;');
                        record.displayIconName = 'utility:close';     
                    }
                    // set the record link with record id  
                    record.linkName = '/'+record.Id;   
                }
            });
            // after the loop set the updated account records on data attribute
           this.data =response;
             console.log('response',response);
             console.log('qwerty',Object.keys(this.data) );
             console.log('qwerty1', this.accounts[Object.keys(this.data)[0]] );
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }
    handleChange(event) {
        var searchKey = event.target.value;
        this.picklistValue = 'none';
        console.log('Current value of the input: ' + searchKey);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            getAccountList({ str : searchKey })
                .then(result => {
                   
                       var response = JSON.parse(result) ;
                var today = new Date();
                var tempDate = ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var tommorow =  ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
                console.log('Success' + response);
                console.log('today',today);
                console.log('tempDate',tempDate);
                console.log('tommorow',tommorow);
                // iterate each records with forEach loop
                response.forEach(function(record){ 
                    if(typeof record.Id != 'undefined'){ 
                        var dueDate =  new Date(record.Due_Date__c);
                        console.log('dueDate',dueDate);
                        console.log('record.Due_Date__c',record.Due_Date__c);
                        // based on VIP Account field value set the icon and style class to each record mportant3
                        // https://www.lightningdesignsystem.com/icons/#utility 
                        if(record.Status__c  != 'Completed' && ( record.Due_Date__c ==  tempDate ||  record.Due_Date__c  == tommorow  )){
                            record.showClass = (record.Status__c != 'Completed' ? 'background-color:yellow !important;' : 'color:black !important;');
                            record.displayIconName = 'utility:check';   
                        }
                        else if ( record.Status__c  != 'Completed' &&  dueDate.getTime() < today.getTime()  ) {
                            record.showClass = (record.Status__c != 'Completed' ? 'background-color:red !important;' : 'color:black !important;');
                            record.displayIconName = 'utility:close';     
                        }
                        // set the record link with record id  
                        record.linkName = '/'+record.Id;   
                    }
                });
                // after the loop set the updated account records on data attribute
                this.data =response;
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                    this.data = undefined;
                });
        }, 100);
    }
//handle save start
handleSave(event) {

    const fields = {};
    fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
    fields[Name.fieldApiName] = event.detail.draftValues[0].Name;
    fields[description.fieldApiName] = event.detail.draftValues[0].Description__c;
    fields[status.fieldApiName] = event.detail.draftValues[0].Status__c;
    fields[Due_Date.fieldApiName] = event.detail.draftValues[0].Due_Date;
    const recordInput = {fields};

    updateRecord(recordInput)
    .then(() => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Contact updated',
                variant: 'success'
            })
        );
        // Clear all draft values
        this.draftValues = [];

        // Display fresh data in the datatable
        return refreshApex(this.data);
    }).catch(error => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating record',
                message: error.body.message,
                variant: 'error'
            })
        );
    });
}
createnew()
{
    console.log('new record');
    window.open("/lightning/o/Task__c/new");
    console.log('end');
}
handleRowActions(event) {
    console.log('rowaction');
    let actionName = event.detail.action.name;

    console.log('actionName ====> ' + actionName);

    let row = event.detail.row;

    window.console.log('row ====> ' + row);
    // eslint-disable-next-line default-case
    switch (actionName) {
        case 'record_details':
            this.viewCurrentRecord(row);
            break;
        case 'edit':
            this.editCurrentRecord(row);
            break;
        case 'delete':
            this.deleteCons(row);
            break;
    }
}
deleteCons(currentRow) 
{
    let currentRecord = [];
    currentRecord.push(currentRow.Id);
    this.showLoadingSpinner = true;

    // calling apex class method to delete the selected contact
    delSelectedCons({lstConIds: currentRecord})
    .then(result => {
        console.log('result ====> ' + result);
        this.showLoadingSpinner = false;

        // showing success message
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success!!',
            message: currentRow.FirstName + ' '+ currentRow.LastName +' Contact deleted.',
            variant: 'success'
        }),);

        // refreshing table data using refresh apex
        this.delayTimeout = setTimeout(() => {
            getAccountList({ str : '' })
                .then(result => {
                   
                var response = JSON.parse(result) ;
        var today = new Date();
        var tempDate = ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var tommorow =  ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
        console.log('Success' + response);
        console.log('today',today);
        console.log('tempDate',tempDate);
        console.log('tommorow',tommorow);
        // iterate each records with forEach loop
        response.forEach(function(record){ 
            if(typeof record.Id != 'undefined'){ 
                var dueDate =  new Date(record.Due_Date__c);
                console.log('dueDate',dueDate);
                console.log('record.Due_Date__c',record.Due_Date__c);
                // based on VIP Account field value set the icon and style class to each record mportant3
                // https://www.lightningdesignsystem.com/icons/#utility 
                if(record.Status__c  != 'Completed' && ( record.Due_Date__c ==  tempDate ||  record.Due_Date__c  == tommorow  )){
                    record.showClass = (record.Status__c != 'Completed' ? 'background-color:yellow !important;' : 'color:black !important;');
                    record.displayIconName = 'utility:check';   
                }
                else if ( record.Status__c  != 'Completed' &&  dueDate.getTime() < today.getTime()  ) {
                    record.showClass = (record.Status__c != 'Completed' ? 'background-color:red !important;' : 'color:black !important;');
                    record.displayIconName = 'utility:close';     
                }
                // set the record link with record id  
                record.linkName = '/'+record.Id;   
            }
        });
        // after the loop set the updated account records on data attribute
        this.data =response;
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                    this.data = undefined;
                });
        }, 100);

    })
    .catch(error => {
        window.console.log('Error ====> '+error);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error!!', 
            message: error.message, 
            variant: 'error'
        }),);
    });
}
editCurrentRecord(currentRow) {
    // open modal box
    this.bShowModal = true;
    this.isEditForm = true;

    // assign record id to the record edit form
    this.currentRecordId = currentRow.Id;
}
handleSubmit(event) {
    // prevending default type sumbit of record edit form
    event.preventDefault();

    // querying the record edit form and submiting fields to form
    this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);

    // closing modal
    this.bShowModal = false;

    // showing success message
    this.dispatchEvent(new ShowToastEvent({
        title: 'Success!!',
        message: event.detail.fields.Name + ' ' +' Contact updated Successfully!!.',
        variant: 'success'
    }),);

}

 // view the current record details
 viewCurrentRecord(currentRow) {
    this.bShowModal = true;
    this.isEditForm = false;
    this.record = currentRow;
}

// closing modal box
closeModal() {
    this.bShowModal = false;
}
handleSuccess() {
    // refreshing table data using refresh apex
    this.delayTimeout = setTimeout(() => {
        getAccountList({ str : '' })
            .then(result => {
               
                var response = JSON.parse(result) ;
        var today = new Date();
        var tempDate = ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var tommorow =  ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
        console.log('Success' + response);
        console.log('today',today);
        console.log('tempDate',tempDate);
        console.log('tommorow',tommorow);
        // iterate each records with forEach loop
        response.forEach(function(record){ 
            if(typeof record.Id != 'undefined'){ 
                var dueDate =  new Date(record.Due_Date__c);
                console.log('dueDate',dueDate);
                console.log('record.Due_Date__c',record.Due_Date__c);
                // based on VIP Account field value set the icon and style class to each record mportant3
                // https://www.lightningdesignsystem.com/icons/#utility 
                if(record.Status__c  != 'Completed' && ( record.Due_Date__c ==  tempDate ||  record.Due_Date__c  == tommorow  )){
                    record.showClass = (record.Status__c != 'Completed' ? 'background-color:yellow !important;' : 'color:black !important;');
                    record.displayIconName = 'utility:check';   
                }
                else if ( record.Status__c  != 'Completed' &&  dueDate.getTime() < today.getTime()  ) {
                    record.showClass = (record.Status__c != 'Completed' ? 'background-color:red !important;' : 'color:black !important;');
                    record.displayIconName = 'utility:close';     
                }
                // set the record link with record id  
                record.linkName = '/'+record.Id;   
            }
        });
        // after the loop set the updated account records on data attribute
        this.data =response;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.data = undefined;
            });
    }, 200);
}

changeInFilter(event)
{
    console.log('picklist',this.picklistValue);
    this.picklistValue =  event.target.value;; 
    console.log('picklist',this.picklistValue);
    if( this.picklistValue == 'none')
    {
        this.delayTimeout = setTimeout() => {
            getAccountList({ str : '' })
                .then(result => {
                   
                    
                var response = JSON.parse(result) ;
                var today = new Date();
                var tempDate = ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var tommorow =  ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
                console.log('Success' + response);
                console.log('today',today);
                console.log('tempDate',tempDate);
                console.log('tommorow',tommorow);
                // iterate each records with forEach loop
                response.forEach(function(record){ 
                    if(typeof record.Id != 'undefined'){ 
                        var dueDate =  new Date(record.Due_Date__c);
                        console.log('dueDate',dueDate);
                        console.log('record.Due_Date__c',record.Due_Date__c);
                        // based on VIP Account field value set the icon and style class to each record mportant3
                        // https://www.lightningdesignsystem.com/icons/#utility 
                        if(record.Status__c  != 'Completed' && ( record.Due_Date__c ==  tempDate ||  record.Due_Date__c  == tommorow  )){
                            record.showClass = (record.Status__c != 'Completed' ? 'background-color:yellow !important;' : 'color:black !important;');
                            record.displayIconName = 'utility:check';   
                        }
                        else if ( record.Status__c  != 'Completed' &&  dueDate.getTime() < today.getTime()  ) {
                            record.showClass = (record.Status__c != 'Completed' ? 'background-color:red !important;' : 'color:black !important;');
                            record.displayIconName = 'utility:close';     
                        }
                        // set the record link with record id  
                        record.linkName = '/'+record.Id;   
                    }
                });
                // after the loop set the updated account records on data attribute
                this.data =response;
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                    this.data = undefined;
                });
        }, 100);
    }
    else 
    {
        this.delayTimeout = setTimeout(() => {
            getTaskListWithFilter({ str : this.picklistValue })
                .then(result => {
                   
                   
                var response = JSON.parse(result) ;
                var today = new Date();
                var tempDate = ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                var tommorow =  ''+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+1);
                console.log('Success' + response);
                console.log('today',today);
                console.log('tempDate',tempDate);
                console.log('tommorow',tommorow);
                // iterate each records with forEach loop
                response.forEach(function(record){ 
                    if(typeof record.Id != 'undefined'){ 
                        var dueDate =  new Date(record.Due_Date__c);
                        console.log('dueDate',dueDate);
                        console.log('record.Due_Date__c',record.Due_Date__c);
                        // based on VIP Account field value set the icon and style class to each record mportant3
                        // https://www.lightningdesignsystem.com/icons/#utility 
                        if(record.Status__c  != 'Completed' && ( record.Due_Date__c ==  tempDate ||  record.Due_Date__c  == tommorow  )){
                            record.showClass = (record.Status__c != 'Completed' ? 'background-color:yellow !important;' : 'color:black !important;');
                            record.displayIconName = 'utility:check';   
                        }
                        else if ( record.Status__c  != 'Completed' &&  dueDate.getTime() < today.getTime()  ) {
                            record.showClass = (record.Status__c != 'Completed' ? 'background-color:red !important;' : 'color:black !important;');
                            record.displayIconName = 'utility:close';     
                        }
                        // set the record link with record id  
                        record.linkName = '/'+record.Id;   
                    }
                });
                // after the loop set the updated account records on data attribute
                this.data =response;
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;
                    this.data = undefined;
                });
        }, 100);
    }
   
}


openmodal() {
    this.openmodel = true
}

saveMethod() {
    alert('save method invoked');
    this.closeModal();
}

handleNameChange(event) {
    this.taskRecord.Name = event.target.value;
    window.console.log('Name ==> '+this.taskRecord.Name);
}

handledescriptionChange(event) {
    this.taskRecord.description = event.target.value;
    window.console.log('description ==> '+this.taskRecord.description);
}

handlestatusChange(event) {
    this.taskRecord.status = event.target.value;
    window.console.log('status ==> '+this.taskRecord.status);
}

handleduedateChange(event) {
    this.taskRecord.Due_Date = event.target.value;
    window.console.log('Due_Date ==> '+this.taskRecord.Due_Date);
}



}
//handle save end
//  sorting code



// sorting code end