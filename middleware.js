function validatePermission(req, rep, next){
  const {permissions} = req.body;

  if(permissions === 'administrador' || permissions === 'cliente')
    return next();
  else
    return rep.status(400).json({error: "Permissão inválida!"});
}


export { validatePermission };