import fs from 'node:fs'
import { YamlEditor } from 'node-karin'


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

   save (name, type, data, other) {
  try {
   let file = this.getFilePath(name, type)
    const Yaml = new YamlEditor(file)
    const ConfigFile = Yaml.get(other)
    Yaml.set(data, other)
    Yaml.save()
  } catch (error) {
    console.error(error)
  }
}
  
}
export default new Config()