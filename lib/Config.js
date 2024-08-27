import YAML from 'yaml'
import fs from 'node:fs'
import lodash from 'lodash'


class Config {
	getFilePath (name, type) {
	  
	  let config_path = `config/${type}/`;
	  let file = `${config_path}${name}.yaml`;
	  try{
		  if(!fs.existsSync(file)){
			  let default_file = `${config_path}default/${name}.yaml`;
			  fs.copyFileSync(default_file,file);
		  }
	  }catch(err){}
	  return file;
  }

   save (name, type, data) {
	let file = this.getFilePath(name, type)
    if (lodash.isEmpty(data)) {
      fs.existsSync(file) && fs.unlinkSync(file)
    } else {
      let yaml = YAML.stringify(data)
      fs.writeFileSync(file, yaml, 'utf8')
    }
  }
  
}
export default new Config()