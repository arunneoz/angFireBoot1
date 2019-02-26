import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirestoreObjectService } from './firestore-object.service';
import { ModelBase } from './model-base';
import { ISessionService } from './i-session.service';


export abstract class BasicFormComponent<T extends ModelBase> {

  formGroup: FormGroup

  object: T

  constructor(protected type: { new(): T; }, protected objectSvc: FirestoreObjectService<T>, protected sessionSvc: ISessionService,
    protected router: Router, private route: ActivatedRoute, ) {
  }

  new() {
    this.object = new this.type()

    this.loadFormGroup(this.object)
  }

  /** Copies the data from the supplied object (parameter) into the form group */
  loadFormGroup(obj: T) {
    this.formGroup.patchValue(obj)
  }

  /** Copies the data from the form group into the supplied object */
  unloadFormGroup(obj: T) {
    Object.assign(this.object, this.formGroup.value)
  }

  processParameters() {

    this.route.params.subscribe(params => {

      let id = params['id']

      console.log(id)

      if (id == 'new')
        this.new()
      else {
        this.objectSvc.getById$(id).subscribe(object => {
          this.object = object
          this.loadFormGroup(object)
        })
      }
    })

  }


  save() {

    this.unloadFormGroup(this.object)

    console.log(this.object)

    this.sessionSvc.showSpinner = true

    this.objectSvc.save(this.object).then(res => {
      console.log('Saved!')

      this.sessionSvc.showSpinner = false
    }, err => {
      this.sessionSvc.showSpinner = false
    })
  }

  delete() {

    let id = this.object.id

    this.sessionSvc.showSpinner = true

    this.objectSvc.delete(id).then(res => {

      console.log(res)

      this.sessionSvc.showSpinner = false
      this.router.navigate(['/products'])
    }, err => {
      this.sessionSvc.showSpinner = false
    })
  }

  isFormOk(formGroup): boolean {
    if (!formGroup)
      return false

    return (formGroup.status == 'VALID')
  }

}
